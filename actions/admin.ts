"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/action-result";

// ============================================================
// GUARD : Vérification stricte du rôle Admin
// ============================================================
async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Non authentifié." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false as const, error: "Accès refusé. Droits administrateur requis." };
  }

  return { ok: true as const, userId: user.id };
}

// ============================================================
// GET STATS
// ============================================================
export async function getAdminStats(): Promise<ActionResult<any>> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_stats");

  if (error) {
    console.error("[getAdminStats] error:", error);
    return { success: false, error: "Impossible de charger les statistiques." };
  }

  return { success: true, data };
}

// ============================================================
// GET USERS (via Admin API)
// ============================================================
type AdminUserListItem = {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  first_name: string;
  last_name: string;
  role: string;
};

type GetAdminUsersResult =
  | {
      success: true;
      data: {
        items: AdminUserListItem[];
        total: number;
        page: number;
        pageSize: number;
      };
    }
  | { success: false; error: string };

export async function getAdminUsers(
  q: string = "",
  page: number = 1,
  pageSize: number = 20
): Promise<GetAdminUsersResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  const adminClient = createAdminClient();

  // L'API Auth de Supabase ne permet pas la recherche directement, on récupère tout et on filtre
  // (Pour un vrai SaaS à grande échelle, on utiliserait une table miroir, mais pour le MVP c'est OK)
  const { data: { users }, error: authError } = await adminClient.auth.admin.listUsers({
    page,
    perPage: 1000, // On charge pour filtrer
  });

  if (authError) {
    console.error("[getAdminUsers] auth error:", authError);
    return { success: false, error: "Impossible de charger les utilisateurs." };
  }

  // Récupérer les profils pour avoir le rôle et le nom
  const userIds = users.map((u) => u.id);
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .in("id", userIds);

  // Fusionner
  let merged = users.map((u) => {
    const p = profiles?.find((prof) => prof.id === u.id);
    return {
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      first_name: p?.first_name ?? "",
      last_name: p?.last_name ?? "",
      role: p?.role ?? "owner",
    };
  });

  // Filtrer par recherche
  if (q) {
    const lowerQ = q.toLowerCase();
    merged = merged.filter(
      (u) =>
        u.email?.toLowerCase().includes(lowerQ) ||
        u.first_name.toLowerCase().includes(lowerQ) ||
        u.last_name.toLowerCase().includes(lowerQ)
    );
  }

  // Trier par date d'inscription (récent d'abord)
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const total = merged.length;
  const paginated = merged.slice((page - 1) * pageSize, page * pageSize);

  return {
    success: true,
    data: {
      items: paginated,
      total,
      page,
      pageSize,
    },
  };
}

// ============================================================
// UPDATE USER ROLE
// ============================================================
export async function updateUserRole(targetUserId: string, newRole: "owner" | "tenant" | "admin"): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  if (targetUserId === auth.userId) {
    return { success: false, error: "Vous ne pouvez pas modifier votre propre rôle." };
  }

  const adminClient = createAdminClient();
  
  const { error } = await adminClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", targetUserId);

  if (error) {
    console.error("[updateUserRole] error:", error);
    return { success: false, error: "Impossible de mettre à jour le rôle." };
  }

  revalidatePath("/admin/users");
  return { success: true, message: `Rôle mis à jour : ${newRole}.` };
}

// ============================================================
// DELETE USER
// ============================================================
export async function deleteUser(targetUserId: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  if (targetUserId === auth.userId) {
    return { success: false, error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  const adminClient = createAdminClient();
  
  // La suppression dans auth.users va CASCADE sur public.profiles
  const { error } = await adminClient.auth.admin.deleteUser(targetUserId);

  if (error) {
    console.error("[deleteUser] error:", error);
    // Gérer l'erreur si l'user possède des propriétés (RESTRICT)
    if (error.message.includes("violates foreign key constraint")) {
      return { success: false, error: "Impossible de supprimer : cet utilisateur possède des propriétés ou des données liées. Transférez-les ou supprimez-les d'abord." };
    }
    return { success: false, error: "Impossible de supprimer l'utilisateur." };
  }

  revalidatePath("/admin/users");
  return { success: true, message: "Utilisateur supprimé." };
}
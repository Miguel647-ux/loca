"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  tenantSchema,
  tenantSearchSchema,
  type TenantInput,
} from "@/lib/validations/tenant";
import type { ActionResult } from "@/lib/action-result";
import type { Tenant, TenantWithActiveLease } from "@/types/database";

// ============================================================
// HELPERS
// ============================================================

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Non authentifié." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "owner") {
    return { ok: false as const, error: "Action réservée aux propriétaires." };
  }

  return { ok: true as const, supabase, userId: user.id };
}

// ============================================================
// GET TENANTS — liste paginée + recherche
// RLS filtre sur owner_id = auth.uid() ou user_id = auth.uid()
// ============================================================

export type GetTenantsResult = {
  items: Tenant[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getTenants(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetTenantsResult>> {
  const parsed = tenantSearchSchema.safeParse(rawParams);
  if (!parsed.success) {
    return { success: false, error: "Paramètres de recherche invalides." };
  }

  const { q, page, pageSize } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("tenants")
    .select("*", { count: "exact" });

  if (q) {
    const escaped = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `first_name.ilike.%${escaped}%,last_name.ilike.%${escaped}%,phone.ilike.%${escaped}%,email.ilike.%${escaped}%`
    );
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("[getTenants] error:", error);
    return { success: false, error: "Impossible de charger les locataires." };
  }

  return {
    success: true,
    data: {
      items: (data ?? []) as Tenant[],
      total: count ?? 0,
      page,
      pageSize,
    },
  };
}

// ============================================================
// GET TENANT — détail + baux associés (via RPC)
// ============================================================

export type GetTenantResult = {
  tenant: Tenant;
  leases: Array<{
    id: string;
    start_date: string;
    end_date: string | null;
    monthly_rent: number;
    deposit_amount: number;
    payment_due_day: number;
    status: string;
    notes: string | null;
    created_at: string;
    unit: { id: string; unit_number: string; property_id: string } | null;
    property: { id: string; name: string } | null;
  }>;
};

export async function getTenant(
  tenantId: string
): Promise<ActionResult<GetTenantResult>> {
  if (!tenantId || typeof tenantId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .maybeSingle();

  if (error) {
    console.error("[getTenant] error:", error);
    return { success: false, error: "Impossible de charger le locataire." };
  }

  if (!tenant) {
    return { success: false, error: "Locataire introuvable." };
  }

  // Baux du tenant via RPC (ownership vérifié dans la fonction)
  const { data: leasesData, error: leasesError } = await supabase.rpc(
    "get_my_tenant_leases",
    { p_tenant_id: tenantId }
  );

  if (leasesError) {
    console.error("[getTenant] leases RPC error:", leasesError);
  }

  return {
    success: true,
    data: {
      tenant: tenant as Tenant,
      leases: (leasesData ?? []) as GetTenantResult["leases"],
    },
  };
}

// ============================================================
// CREATE TENANT
// owner_id imposé côté serveur.
// ============================================================

export async function createTenant(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = tenantSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase, userId } = auth;

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      owner_id: userId,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      id_number: parsed.data.id_number || null,
      emergency_contact_name: parsed.data.emergency_contact_name || null,
      emergency_contact_phone: parsed.data.emergency_contact_phone || null,
      notes: parsed.data.notes || null,
      // user_id volontairement omis → null par défaut
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createTenant] error:", error);
    return { success: false, error: "Impossible de créer le locataire." };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true, data: { id: data.id } };
}

// ============================================================
// UPDATE TENANT
// ============================================================

export async function updateTenant(
  tenantId: string,
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  if (!tenantId || typeof tenantId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const parsed = tenantSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  // Defense in depth : vérif ownership explicite
  const { data: existing } = await supabase
    .from("tenants")
    .select("id, owner_id")
    .eq("id", tenantId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Locataire introuvable." };
  }

  if (existing.owner_id !== auth.userId) {
    return { success: false, error: "Accès refusé." };
  }

  const { data, error } = await supabase
    .from("tenants")
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      id_number: parsed.data.id_number || null,
      emergency_contact_name: parsed.data.emergency_contact_name || null,
      emergency_contact_phone: parsed.data.emergency_contact_phone || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", tenantId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("[updateTenant] error:", error);
    return { success: false, error: "Impossible de mettre à jour le locataire." };
  }

  revalidatePath("/dashboard/tenants");
  revalidatePath(`/dashboard/tenants/${tenantId}`);
  return { success: true, data: { id: data.id } };
}

// ============================================================
// DELETE TENANT
// Refusé par la FK leases.tenant_id ON DELETE RESTRICT si bail existe.
// On traduit l'erreur PostgreSQL en message clair.
// ============================================================

export async function deleteTenant(tenantId: string): Promise<ActionResult> {
  if (!tenantId || typeof tenantId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  const { data: existing } = await supabase
    .from("tenants")
    .select("id, owner_id")
    .eq("id", tenantId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Locataire introuvable." };
  }

  if (existing.owner_id !== auth.userId) {
    return { success: false, error: "Accès refusé." };
  }

  const { error } = await supabase
    .from("tenants")
    .delete()
    .eq("id", tenantId);

  if (error) {
    console.error("[deleteTenant] error:", error);
    // 23503 = FK violation → historique de bail existe
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "Impossible de supprimer ce locataire : il possède un ou plusieurs baux dans l'historique. Conservez l'historique ou terminez d'abord ses baux.",
      };
    }
    return { success: false, error: "Impossible de supprimer le locataire." };
  }

  revalidatePath("/dashboard/tenants");
  return { success: true, message: "Locataire supprimé." };
}
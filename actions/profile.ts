"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";

// ============================================================
// TYPES
// ============================================================

export type UserContext = {
  user_id: string;
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    avatar_url: string | null;
    role: string;
  } | null;
  is_tenant: boolean;
  tenant_id: string | null;
  properties_count: number;
};

// ============================================================
// GET USER CONTEXT
// ============================================================

export async function getUserContext(): Promise<ActionResult<UserContext>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_user_context");

  if (error) {
    console.error("[getUserContext] RPC error:", error);
    return { success: false, error: "Impossible de charger le contexte." };
  }

  return { success: true, data: data as UserContext };
}

// ============================================================
// UPDATE MY PROFILE
// ============================================================

export async function updateMyProfile(
  rawInput: unknown
): Promise<ActionResult> {
  const input = rawInput as {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };

  if (
    !input ||
    typeof input.first_name !== "string" ||
    typeof input.last_name !== "string"
  ) {
    return { success: false, error: "Données invalides." };
  }

  const fn = input.first_name.trim();
  const ln = input.last_name.trim();
  if (fn.length < 1 || fn.length > 100) {
    return {
      success: false,
      error: "Prénom invalide.",
      fieldErrors: { first_name: ["Invalide."] },
    };
  }
  if (ln.length < 1 || ln.length > 100) {
    return {
      success: false,
      error: "Nom invalide.",
      fieldErrors: { last_name: ["Invalide."] },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { error } = await supabase.rpc("update_my_profile", {
    p_first_name: fn,
    p_last_name: ln,
    p_phone: (input.phone ?? "").trim() || null,
  });

  if (error) {
    console.error("[updateMyProfile] RPC error:", error);
    return { success: false, error: "Impossible de mettre à jour le profil." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/", "layout");
  return { success: true, message: "Profil mis à jour." };
}

// ============================================================
// CHANGE MY PASSWORD
// ============================================================

export async function changeMyPassword(
  rawInput: unknown
): Promise<ActionResult> {
  const input = rawInput as {
    password?: string;
    confirmPassword?: string;
  };

  if (!input || typeof input.password !== "string" || input.password.length < 8) {
    return {
      success: false,
      error: "Le mot de passe doit contenir au moins 8 caractères.",
      fieldErrors: { password: ["Trop court."] },
    };
  }

  if (input.password !== input.confirmPassword) {
    return {
      success: false,
      error: "Les mots de passe ne correspondent pas.",
      fieldErrors: { confirmPassword: ["Ne correspond pas."] },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });

  if (error) {
    console.error("[changeMyPassword] error:", error);
    return {
      success: false,
      error: "Impossible de changer le mot de passe.",
    };
  }

  return { success: true, message: "Mot de passe mis à jour." };
}

// ============================================================
// SIGN OUT EVERYWHERE
// ============================================================

export async function signOutEverywhere(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
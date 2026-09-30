"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";
import type { OwnerDashboard, TenantDashboard } from "@/types/dashboard";

// ============================================================
// OWNER DASHBOARD
// ============================================================

export async function getOwnerDashboard(): Promise<
  ActionResult<OwnerDashboard>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_owner_dashboard");

  if (error) {
    console.error("[getOwnerDashboard] RPC error:", error);
    return { success: false, error: "Impossible de charger le tableau de bord." };
  }

  if (!data) {
    return { success: false, error: "Aucune donnée retournée." };
  }

  return { success: true, data: data as OwnerDashboard };
}

// ============================================================
// TENANT DASHBOARD
// ============================================================

export async function getTenantDashboard(): Promise<
  ActionResult<TenantDashboard>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_tenant_dashboard");

  if (error) {
    console.error("[getTenantDashboard] RPC error:", error);
    return { success: false, error: "Impossible de charger le tableau de bord." };
  }

  if (!data) {
    return { success: false, error: "Aucune donnée retournée." };
  }

  return { success: true, data: data as TenantDashboard };
}
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createLeaseSchema,
  updateLeaseSchema,
  endLeaseSchema,
  leaseSearchSchema,
  type CreateLeaseInput,
  type UpdateLeaseInput,
  type EndLeaseInput,
} from "@/lib/validations/lease";
import type { ActionResult } from "@/lib/action-result";
import type { Lease, LeaseWithRelations } from "@/types/database";

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

/**
 * Traduit les exceptions SQL des RPC en messages utilisateur clairs.
 */
function translateRpcError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("authentication required")) {
    return "Session expirée. Reconnectez-vous.";
  }
  if (m.includes("not authorized") || m.includes("not found or not authorized")) {
    return "Accès refusé.";
  }
  if (m.includes("unit not found")) {
    return "Logement introuvable.";
  }
  if (m.includes("tenant not found")) {
    return "Locataire introuvable.";
  }
  if (m.includes("already has an active lease")) {
    return "Ce logement a déjà un bail actif.";
  }
  if (m.includes("already terminated")) {
    return "Ce bail est déjà terminé.";
  }
  if (m.includes("cannot activate a lease on a maintenance unit")) {
    return "Impossible d'activer un bail sur un logement en maintenance.";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}

// ============================================================
// GET LEASES — liste paginée + recherche + filtre
// ============================================================

export type GetLeasesResult = {
  items: LeaseWithRelations[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getLeases(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetLeasesResult>> {
  const parsed = leaseSearchSchema.safeParse(rawParams);
  if (!parsed.success) {
    return { success: false, error: "Paramètres de recherche invalides." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { data, error } = await supabase.rpc("list_my_leases", {
    p_q: parsed.data.q,
    p_status: parsed.data.status,
    p_page: parsed.data.page,
    p_page_size: parsed.data.pageSize,
  });

  if (error) {
    console.error("[getLeases] RPC error:", error);
    return { success: false, error: "Impossible de charger les baux." };
  }

  const result = data as {
    items: LeaseWithRelations[];
    total: number;
    page: number;
    pageSize: number;
  } | null;

  return {
    success: true,
    data: {
      items: result?.items ?? [],
      total: result?.total ?? 0,
      page: result?.page ?? 1,
      pageSize: result?.pageSize ?? 12,
    },
  };
}

// ============================================================
// GET LEASE — détail
// ============================================================

export async function getLease(
  leaseId: string
): Promise<ActionResult<LeaseWithRelations>> {
  if (!leaseId || typeof leaseId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { data, error } = await supabase.rpc("get_my_lease", {
    p_lease_id: leaseId,
  });

  if (error) {
    console.error("[getLease] RPC error:", error);
    return { success: false, error: "Impossible de charger le bail." };
  }

  if (!data) {
    return { success: false, error: "Bail introuvable." };
  }

  return { success: true, data: data as LeaseWithRelations };
}

// ============================================================
// GET ACTIVE LEASE FOR UNIT — pour la fiche logement
// ============================================================

export type ActiveLeaseInfo = {
  id: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit_amount: number;
  payment_due_day: number;
  status: string;
  notes: string | null;
  tenant: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
};

export async function getActiveLeaseForUnit(
  unitId: string
): Promise<ActionResult<ActiveLeaseInfo | null>> {
  if (!unitId || typeof unitId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { data, error } = await supabase.rpc("get_active_lease_for_unit", {
    p_unit_id: unitId,
  });

  if (error) {
    console.error("[getActiveLeaseForUnit] RPC error:", error);
    return { success: false, error: "Impossible de charger le bail actif." };
  }

  return { success: true, data: (data as ActiveLeaseInfo | null) ?? null };
}

// ============================================================
// GET TENANT LEASES — pour la fiche locataire
// (déjà exposé via getTenant, mais disponible standalone)
// ============================================================

export type TenantLeaseItem = {
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
};

export async function getTenantLeases(
  tenantId: string
): Promise<ActionResult<TenantLeaseItem[]>> {
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

  const { data, error } = await supabase.rpc("get_my_tenant_leases", {
    p_tenant_id: tenantId,
  });

  if (error) {
    console.error("[getTenantLeases] RPC error:", error);
    return { success: false, error: "Impossible de charger les baux." };
  }

  return { success: true, data: (data ?? []) as TenantLeaseItem[] };
}

// ============================================================
// CREATE LEASE
// ============================================================

export async function createLease(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createLeaseSchema.safeParse(rawInput);
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
  const d = parsed.data;

  const { data, error } = await supabase.rpc("create_my_lease", {
    p_unit_id: d.unit_id,
    p_tenant_id: d.tenant_id,
    p_start_date: d.start_date,
    p_end_date: d.end_date || null,
    p_monthly_rent: d.monthly_rent,
    p_deposit_amount: d.deposit_amount,
    p_payment_due_day: d.payment_due_day,
    p_status: d.status,
    p_notes: d.notes || null,
  });

  if (error) {
    console.error("[createLease] RPC error:", error);
    return { success: false, error: translateRpcError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const leaseId = (row as Lease).id;

  revalidatePath("/dashboard/leases");
  revalidatePath(`/dashboard/tenants/${d.tenant_id}`);
  revalidatePath("/dashboard/properties");
  return { success: true, data: { id: leaseId } };
}

// ============================================================
// UPDATE LEASE
// unit_id et tenant_id sont immuables.
// ============================================================

export async function updateLease(
  leaseId: string,
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  if (!leaseId || typeof leaseId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const parsed = updateLeaseSchema.safeParse(rawInput);
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
  const d = parsed.data;

  const { data, error } = await supabase.rpc("update_my_lease", {
    p_lease_id: leaseId,
    p_start_date: d.start_date,
    p_end_date: d.end_date || null,
    p_monthly_rent: d.monthly_rent,
    p_deposit_amount: d.deposit_amount,
    p_payment_due_day: d.payment_due_day,
    p_status: d.status,
    p_notes: d.notes || null,
  });

  if (error) {
    console.error("[updateLease] RPC error:", error);
    return { success: false, error: translateRpcError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const lease = row as Lease;

  revalidatePath("/dashboard/leases");
  revalidatePath(`/dashboard/leases/${leaseId}`);
  revalidatePath(`/dashboard/tenants/${lease.tenant_id}`);
  revalidatePath("/dashboard/properties");
  return { success: true, data: { id: leaseId } };
}

// ============================================================
// END LEASE — terminaison (jamais de suppression)
// ============================================================

export async function endLease(
  leaseId: string,
  rawInput: unknown
): Promise<ActionResult> {
  if (!leaseId || typeof leaseId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const parsed = endLeaseSchema.safeParse(rawInput);
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

  const { data, error } = await supabase.rpc("end_my_lease", {
    p_lease_id: leaseId,
    p_end_date: parsed.data.end_date,
    p_notes: parsed.data.notes || null,
  });

  if (error) {
    console.error("[endLease] RPC error:", error);
    return { success: false, error: translateRpcError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const lease = row as Lease;

  revalidatePath("/dashboard/leases");
  revalidatePath(`/dashboard/leases/${leaseId}`);
  revalidatePath(`/dashboard/tenants/${lease.tenant_id}`);
  revalidatePath("/dashboard/properties");
  return { success: true, message: "Bail terminé." };
}
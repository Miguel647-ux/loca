"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createRentDueSchema,
  rentDueSearchSchema,
} from "@/lib/validations/rent-due";
import type { ActionResult } from "@/lib/action-result";
import type {
  RentDue,
  RentDueListItem,
  RentDueDetail,
  RentDuesStats,
} from "@/types/database";

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

function translateRpcError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("authentication required")) return "Session expirée.";
  if (m.includes("not authorized")) return "Accès refusé.";
  if (m.includes("lease not found")) return "Bail introuvable.";
  if (m.includes("amount due must be greater than zero"))
    return "Le montant doit être supérieur à zéro.";
  if (m.includes("invalid period"))
    return "Période invalide : la fin doit être postérieure au début.";
  if (m.includes("duplicate key") || m.includes("rent_due_unique_period"))
    return "Une échéance existe déjà pour cette période sur ce bail.";
  return "Une erreur est survenue. Veuillez réessayer.";
}

// ============================================================
// GET RENT DUES — liste paginée
// ============================================================

export type GetRentDuesResult = {
  items: RentDueListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getRentDues(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetRentDuesResult>> {
  const parsed = rentDueSearchSchema.safeParse(rawParams);
  if (!parsed.success) {
    return { success: false, error: "Paramètres invalides." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_rent_dues", {
    p_q: parsed.data.q,
    p_status: parsed.data.status,
    p_page: parsed.data.page,
    p_page_size: parsed.data.pageSize,
  });

  if (error) {
    console.error("[getRentDues] RPC error:", error);
    return { success: false, error: "Impossible de charger les loyers dus." };
  }

  const result = data as {
    items: RentDueListItem[];
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
      pageSize: result?.pageSize ?? 20,
    },
  };
}

// ============================================================
// GET RENT DUE — détail
// ============================================================

export async function getRentDue(
  rentDueId: string
): Promise<ActionResult<RentDueDetail>> {
  if (!rentDueId || typeof rentDueId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_rent_due", {
    p_rent_due_id: rentDueId,
  });

  if (error) {
    console.error("[getRentDue] RPC error:", error);
    return { success: false, error: "Impossible de charger l'échéance." };
  }

  if (!data) {
    return { success: false, error: "Échéance introuvable." };
  }

  return { success: true, data: data as RentDueDetail };
}

// ============================================================
// GET RENT DUES FOR LEASE
// ============================================================

export async function getRentDuesForLease(
  leaseId: string
): Promise<ActionResult<RentDueListItem[]>> {
  if (!leaseId || typeof leaseId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_rent_dues_for_lease", {
    p_lease_id: leaseId,
  });

  if (error) {
    console.error("[getRentDuesForLease] RPC error:", error);
    return { success: false, error: "Impossible de charger les échéances." };
  }

  return { success: true, data: (data ?? []) as RentDueListItem[] };
}

// ============================================================
// GET STATS
// ============================================================

export async function getRentDuesStats(): Promise<
  ActionResult<RentDuesStats>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_rent_dues_stats");

  if (error) {
    console.error("[getRentDuesStats] RPC error:", error);
    return { success: false, error: "Impossible de charger les statistiques." };
  }

  return {
    success: true,
    data:
      (data as RentDuesStats) ?? {
        total_due: 0,
        total_paid: 0,
        total_remaining: 0,
        count_paid: 0,
        count_partial: 0,
        count_late: 0,
        count_pending: 0,
      },
  };
}

// ============================================================
// CREATE RENT DUE
// ============================================================

export async function createRentDue(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = createRentDueSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) return { success: false, error: auth.error };

  const { supabase } = auth;
  const d = parsed.data;

  const { data, error } = await supabase.rpc("create_my_rent_due", {
    p_lease_id: d.lease_id,
    p_period_start: d.period_start,
    p_period_end: d.period_end,
    p_due_date: d.due_date,
    p_amount_due: d.amount_due,
  });

  if (error) {
    console.error("[createRentDue] RPC error:", error);
    return { success: false, error: translateRpcError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const due = row as RentDue;

  revalidatePath("/dashboard/payments");
  revalidatePath(`/dashboard/leases/${d.lease_id}`);
  return { success: true, data: { id: due.id } };
}
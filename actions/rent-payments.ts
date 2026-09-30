"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  recordRentPaymentSchema,
} from "@/lib/validations/rent-payment";
import type { ActionResult } from "@/lib/action-result";
import type { RentPayment, RentPaymentWithProfile } from "@/types/database";

// ============================================================
// HELPERS
// ============================================================

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Non authentifié." };

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

function translatePaymentError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("authentication required")) return "Session expirée.";
  if (m.includes("not authorized")) return "Accès refusé.";
  if (m.includes("rent due not found")) return "Échéance introuvable.";
  if (m.includes("payment amount must be greater than zero"))
    return "Le montant doit être supérieur à zéro.";
  if (m.includes("payment exceeds remaining balance"))
    return "Le montant dépasse le solde restant.";
  return "Une erreur est survenue. Veuillez réessayer.";
}

// ============================================================
// GET PAYMENTS FOR RENT DUE
// ============================================================

export async function getRentPayments(
  rentDueId: string
): Promise<ActionResult<RentPaymentWithProfile[]>> {
  if (!rentDueId || typeof rentDueId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_rent_payments", {
    p_rent_due_id: rentDueId,
  });

  if (error) {
    console.error("[getRentPayments] RPC error:", error);
    return { success: false, error: "Impossible de charger les paiements." };
  }

  return { success: true, data: (data ?? []) as RentPaymentWithProfile[] };
}

// ============================================================
// RECORD PAYMENT
// ============================================================

export async function recordRentPayment(
  rawInput: unknown
): Promise<ActionResult<RentPayment>> {
  const parsed = recordRentPaymentSchema.safeParse(rawInput);
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

  const { data, error } = await supabase.rpc("record_rent_payment", {
    p_rent_due_id: d.rent_due_id,
    p_amount: d.amount,
    p_payment_method: d.payment_method,
    p_reference: d.reference || null,
    p_notes: d.notes || null,
    p_payment_date: d.payment_date,
  });

  if (error) {
    console.error("[recordRentPayment] RPC error:", error);
    return { success: false, error: translatePaymentError(error.message) };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const payment = row as RentPayment;

  revalidatePath("/dashboard/payments");
  revalidatePath(`/dashboard/payments/${d.rent_due_id}`);
  return { success: true, data: payment };
}
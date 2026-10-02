"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/action-result";

// ============================================================
// TYPES
// ============================================================

export type TenantPortalDue = {
  id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  status: string;
};

export type TenantPortalDueDetail = TenantPortalDue & {
  lease_id: string;
  unit_id: string;
  unit_number: string;
  property_id: string;
  property_name: string;
  address: string;
  city: string;
  lease_start_date: string;
  lease_end_date: string | null;
  lease_monthly_rent: number;
  payment_due_day: number;
};

export type TenantPortalPayment = {
  id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference: string | null;
  notes: string | null;
  created_at: string;
  receipt_id: string | null;
  receipt_number: string | null;
};

export type TenantPortalReceipt = {
  id: string;
  payment_id: string;
  receipt_number: string;
  issued_at: string;
  pdf_storage_path: string | null;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  period_start: string;
  period_end: string;
  unit_number: string;
  property_name: string;
};

export type TenantPortalProfile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
};

// ============================================================
// GET RENT DUES
// ============================================================

export type GetTenantDuesResult = {
  items: TenantPortalDue[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getTenantRentDues(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetTenantDuesResult>> {
  const q = typeof rawParams.q === "string" ? rawParams.q : "";
  const status = typeof rawParams.status === "string" ? rawParams.status : "all";
  const page = Number(rawParams.page) || 1;
  const pageSize = Number(rawParams.pageSize) || 20;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_tenant_rent_dues", {
    p_q: q,
    p_status: status,
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) {
    console.error("[getTenantRentDues] RPC error:", error);
    return { success: false, error: "Impossible de charger les échéances." };
  }

  const result = data as GetTenantDuesResult | null;
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
// GET RENT DUE DETAIL
// ============================================================

export async function getTenantRentDue(
  rentDueId: string
): Promise<ActionResult<TenantPortalDueDetail>> {
  if (!rentDueId || typeof rentDueId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_tenant_rent_due", {
    p_rent_due_id: rentDueId,
  });

  if (error) {
    console.error("[getTenantRentDue] RPC error:", error);
    return { success: false, error: "Impossible de charger l'échéance." };
  }

  if (!data) return { success: false, error: "Échéance introuvable." };

  return { success: true, data: data as TenantPortalDueDetail };
}

// ============================================================
// GET PAYMENTS FOR DUE
// ============================================================

export async function getTenantRentPayments(
  rentDueId: string
): Promise<ActionResult<TenantPortalPayment[]>> {
  if (!rentDueId || typeof rentDueId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_tenant_rent_payments", {
    p_rent_due_id: rentDueId,
  });

  if (error) {
    console.error("[getTenantRentPayments] RPC error:", error);
    return { success: false, error: "Impossible de charger les paiements." };
  }

  return { success: true, data: (data ?? []) as TenantPortalPayment[] };
}

// ============================================================
// GET RECEIPTS
// ============================================================

export type GetTenantReceiptsResult = {
  items: TenantPortalReceipt[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getTenantReceipts(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetTenantReceiptsResult>> {
  const page = Number(rawParams.page) || 1;
  const pageSize = Number(rawParams.pageSize) || 20;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_tenant_receipts", {
    p_page: page,
    p_page_size: pageSize,
  });

  if (error) {
    console.error("[getTenantReceipts] RPC error:", error);
    return { success: false, error: "Impossible de charger les reçus." };
  }

  const result = data as GetTenantReceiptsResult | null;
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
// GET RECEIPT DETAIL
// ============================================================

export async function getTenantReceipt(
  receiptId: string
): Promise<ActionResult<import("@/types/database").ReceiptWithRelations>> {
  if (!receiptId || typeof receiptId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_tenant_receipt", {
    p_receipt_id: receiptId,
  });

  if (error) {
    console.error("[getTenantReceipt] RPC error:", error);
    return { success: false, error: "Impossible de charger le reçu." };
  }

  if (!data) return { success: false, error: "Reçu introuvable." };

  return {
    success: true,
    data: data as import("@/types/database").ReceiptWithRelations,
  };
}

// ============================================================
// UPDATE TENANT PROFILE
// ============================================================

export async function updateTenantProfile(
  rawInput: unknown
): Promise<ActionResult<TenantPortalProfile>> {
  const input = rawInput as { phone?: string; email?: string };

  if (!input || typeof input.phone !== "string") {
    return { success: false, error: "Téléphone requis." };
  }

  const phone = input.phone.trim();
  if (phone.length < 3 || phone.length > 30) {
    return {
      success: false,
      error: "Le téléphone doit contenir entre 3 et 30 caractères.",
      fieldErrors: { phone: ["Longueur invalide."] },
    };
  }

  const email = (input.email ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: "Adresse email invalide.",
      fieldErrors: { email: ["Format invalide."] },
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("update_my_tenant_profile", {
    p_phone: phone,
    p_email: email || null,
  });

  if (error) {
    console.error("[updateTenantProfile] RPC error:", error);
    const m = error.message.toLowerCase();
    if (m.includes("not found or not linked")) {
      return { success: false, error: "Compte non lié à un dossier locataire." };
    }
    return { success: false, error: "Impossible de mettre à jour le profil." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const t = row as {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
  };

  revalidatePath("/tenant/profile");
  revalidatePath("/tenant");
  return {
    success: true,
    data: {
      id: t.id,
      first_name: t.first_name,
      last_name: t.last_name,
      phone: t.phone,
      email: t.email,
    },
  };
}
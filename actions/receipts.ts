"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createStorageClient } from "@/lib/supabase/storage";
import { receiptSearchSchema } from "@/lib/validations/receipt";
import { generateReceiptPdf } from "@/lib/receipts/generate-pdf";
import type { ActionResult } from "@/lib/action-result";
import type { Receipt, ReceiptWithRelations } from "@/types/database";

const RECEIPT_FILES_BUCKET = "loca-files";

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

async function getAccessToken(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: "Session expirée. Reconnectez-vous." };
  }
  return { ok: true, token: session.access_token };
}

// ============================================================
// GET RECEIPTS — liste paginée
// ============================================================

export type GetReceiptsResult = {
  items: Array<{
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
    amount_due: number;
    tenant_id: string;
    tenant_first_name: string;
    tenant_last_name: string;
    unit_number: string;
    property_id: string;
    property_name: string;
  }>;
  total: number;
  page: number;
  pageSize: number;
};

export async function getReceipts(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetReceiptsResult>> {
  const parsed = receiptSearchSchema.safeParse(rawParams);
  if (!parsed.success) return { success: false, error: "Paramètres invalides." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_receipts", {
    p_q: parsed.data.q,
    p_page: parsed.data.page,
    p_page_size: parsed.data.pageSize,
  });

  if (error) {
    console.error("[getReceipts] RPC error:", error);
    return { success: false, error: "Impossible de charger les reçus." };
  }

  const result = data as GetReceiptsResult | null;

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
// GET RECEIPT — détail
// ============================================================

export async function getReceipt(
  receiptId: string
): Promise<ActionResult<ReceiptWithRelations>> {
  if (!receiptId || typeof receiptId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("get_my_receipt", {
    p_receipt_id: receiptId,
  });

  if (error) {
    console.error("[getReceipt] RPC error:", error);
    return { success: false, error: "Impossible de charger le reçu." };
  }

  if (!data) return { success: false, error: "Reçu introuvable." };

  return { success: true, data: data as ReceiptWithRelations };
}

// ============================================================
// CREATE RECEIPT (idempotent)
// ============================================================

export async function createReceipt(
  paymentId: string
): Promise<ActionResult<{ id: string }>> {
  if (!paymentId || typeof paymentId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const auth = await requireOwner();
  if (!auth.ok) return { success: false, error: auth.error };

  const { supabase } = auth;

  const { data, error } = await supabase.rpc("create_my_receipt", {
    p_payment_id: paymentId,
  });

  if (error) {
    console.error("[createReceipt] RPC error:", error);
    const m = error.message.toLowerCase();
    if (m.includes("payment not found")) {
      return { success: false, error: "Paiement introuvable." };
    }
    if (m.includes("not authorized")) {
      return { success: false, error: "Accès refusé." };
    }
    return { success: false, error: "Impossible de générer le reçu." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const receipt = row as Receipt;

  revalidatePath("/dashboard/receipts");
  revalidatePath(`/dashboard/payments/${paymentId}`);
  return { success: true, data: { id: receipt.id } };
}

// ============================================================
// GENERATE PDF + UPLOAD STORAGE
// Idempotent : si le PDF existe déjà, on le régénère quand même
// (au cas où des données ont changé, mais le reçu n'est pas modifiable).
// ============================================================

export async function generateAndStoreReceiptPdf(
  receiptId: string
): Promise<ActionResult<{ path: string }>> {
  if (!receiptId || typeof receiptId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const auth = await requireOwner();
  if (!auth.ok) return { success: false, error: auth.error };

  const { supabase } = auth;

  // Récupère le reçu + relations
  const { data: receiptData, error: fetchError } = await supabase.rpc(
    "get_my_receipt",
    { p_receipt_id: receiptId }
  );

  if (fetchError || !receiptData) {
    return { success: false, error: "Reçu introuvable." };
  }

  const receipt = receiptData as ReceiptWithRelations;

  // Chemin : receipts/<payment_id>/<receipt_number>.pdf
  const path = `receipts/${receipt.payment_id}/${receipt.receipt_number}.pdf`;

  // Génération PDF
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateReceiptPdf(receipt);
  } catch (e) {
    console.error("[generateAndStoreReceiptPdf] render error:", e);
    return { success: false, error: "Impossible de générer le PDF." };
  }

  // Upload Storage
  const tokenResult = await getAccessToken(supabase);
  if (!tokenResult.ok) {
    return { success: false, error: tokenResult.error };
  }

  const storageClient = createStorageClient(tokenResult.token);
  const { error: uploadError } = await storageClient.storage
    .from(RECEIPT_FILES_BUCKET)
    .upload(path, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("[generateAndStoreReceiptPdf] storage error:", uploadError);
    return { success: false, error: "Impossible d'enregistrer le PDF." };
  }

  // Attache le chemin via RPC (receipts n'a pas de policy UPDATE)
const { error: attachError } = await supabase.rpc("attach_receipt_pdf", {
  p_receipt_id: receiptId,
  p_path: path,
});

if (attachError) {
  console.error("[generateAndStoreReceiptPdf] attach error:", attachError);
  return {
    success: false,
    error: "PDF uploadé mais impossible de l'attacher au reçu.",
  };
}

  revalidatePath(`/dashboard/receipts/${receiptId}`);
  return { success: true, data: { path } };
}

// ============================================================
// GET SIGNED URL for receipt PDF
// ============================================================

export async function getReceiptSignedUrl(
  storagePath: string,
  expiresIn: number = 600
): Promise<ActionResult<{ url: string }>> {
  if (!storagePath || typeof storagePath !== "string") {
    return { success: false, error: "Chemin invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const tokenResult = await getAccessToken(supabase);
  if (!tokenResult.ok) {
    return { success: false, error: tokenResult.error };
  }

  const storageClient = createStorageClient(tokenResult.token);
  const { data, error } = await storageClient.storage
    .from(RECEIPT_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data) {
    return { success: false, error: "Impossible de générer l'URL." };
  }

  return { success: true, data: { url: data.signedUrl } };
}
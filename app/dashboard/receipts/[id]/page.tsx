import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getReceipt } from "@/actions/receipts";
import { ReceiptView } from "@/components/receipts/receipt-view";
import { DownloadReceiptPdfButton } from "@/components/receipts/download-pdf-button";

export const metadata: Metadata = { title: "Reçu — Loca" };

export default async function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const result = await getReceipt(id);
  if (!result.success) notFound();

  const receipt = result.data!;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/dashboard/receipts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux reçus
        </Link>
        <DownloadReceiptPdfButton
          storagePath={receipt.pdf_storage_path ?? null}
        />
      </div>

      <ReceiptView receipt={receipt} />
    </div>
  );
}
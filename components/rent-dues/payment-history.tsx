import Link from "next/link";
import { FileText, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { GenerateReceiptButton } from "@/components/receipts/generate-receipt-button";
import { DownloadReceiptPdfButton } from "@/components/receipts/download-pdf-button";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/validations/rent-payment";
import type { RentPaymentWithProfile } from "@/types/database";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function PaymentHistory({
  payments,
}: {
  payments: RentPaymentWithProfile[];
}) {
  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Receipt className="size-5" />
          <p className="text-sm">Aucun paiement enregistré pour cette échéance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((p) => (
        <div key={p.id} className="rounded-lg border bg-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-[var(--brand)]/10">
                <Receipt className="size-4 text-[var(--brand)]" />
              </div>
              <div>
                <p className="text-sm font-medium tabular-nums">
                  {formatCurrency(Number(p.amount))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(p.payment_date)} ·{" "}
                  {PAYMENT_METHOD_LABELS[
                    p.payment_method as PaymentMethod
                  ] ?? p.payment_method}
                  {p.recorded_by_profile && (
                    <>
                      {" · "}
                      {p.recorded_by_profile.first_name}{" "}
                      {p.recorded_by_profile.last_name}
                    </>
                  )}
                </p>
              </div>
            </div>
            {p.reference && (
              <p className="text-xs text-muted-foreground sm:text-right">
                Réf. <span className="font-mono">{p.reference}</span>
              </p>
            )}
          </div>

          {p.notes && (
            <div className="rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {p.notes}
            </div>
          )}

          {/* Zone reçu */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t">
            {p.receipt ? (
              <>
                <div className="text-xs">
                  <span className="font-mono text-muted-foreground">
                    {p.receipt.receipt_number}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/receipts/${p.receipt.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" })
                    )}
                  >
                    <FileText className="size-3.5" />
                    Voir le reçu
                  </Link>
                  <DownloadReceiptPdfButton
                    storagePath={p.receipt.pdf_storage_path}
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Aucun reçu émis pour ce paiement.
                </p>
                <GenerateReceiptButton
                  paymentId={p.id}
                  variant="outline"
                  redirectToReceipt={false}
                />
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
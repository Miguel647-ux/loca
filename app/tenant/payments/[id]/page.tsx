import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Receipt as ReceiptIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  getTenantRentDue,
  getTenantRentPayments,
} from "@/actions/tenant-portal";
import { TenantDueStatusBadge } from "@/components/tenant-portal/due-status-badge";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/validations/rent-payment";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Détail échéance — Loca" };

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

export default async function TenantDueDetailPage({
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
  const result = await getTenantRentDue(id);
  if (!result.success) notFound();

  const due = result.data!;
  const paymentsResult = await getTenantRentPayments(due.id);
  const payments = paymentsResult.success ? paymentsResult.data! : [];

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-4">
        <Link
          href="/tenant/payments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux échéances
        </Link>

        <div className="flex items-center gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight capitalize">
            {new Intl.DateTimeFormat("fr-FR", {
              month: "long",
              year: "numeric",
            }).format(new Date(due.period_start))}
          </h1>
          <TenantDueStatusBadge status={due.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          Échéance le {formatDate(due.due_date)}
        </p>
      </div>

      {/* Montants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Montant dû</p>
          <p className="font-heading text-lg font-semibold tabular-nums">
            {formatCurrency(Number(due.amount_due))}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Déjà payé</p>
          <p className="font-heading text-lg font-semibold tabular-nums">
            {formatCurrency(Number(due.amount_paid))}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Solde restant</p>
          <p
            className={cn(
              "font-heading text-lg font-semibold tabular-nums",
              Number(due.amount_remaining) > 0 ? "text-[var(--brand)]" : ""
            )}
          >
            {formatCurrency(Number(due.amount_remaining))}
          </p>
        </div>
      </div>

      {/* Logement concerné */}
      <div className="rounded-lg border bg-card p-5 space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Logement concerné
        </h2>
        <div>
          <p className="font-medium">{due.property_name}</p>
          <p className="text-sm text-muted-foreground">
            {due.address}, {due.city}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Logement {due.unit_number}
          </p>
        </div>
      </div>

      {/* Historique des paiements */}
      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          Historique des paiements
        </h2>

        {payments.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ReceiptIcon className="size-5" />
              <p className="text-sm">
                Aucun paiement enregistré pour cette échéance.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[var(--brand)]/10">
                      <ReceiptIcon className="size-4 text-[var(--brand)]" />
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

                {p.receipt_id && (
                  <div className="flex items-center justify-between gap-3 pt-2 border-t">
                    <span className="font-mono text-xs text-muted-foreground">
                      {p.receipt_number}
                    </span>
                    <Link
                      href={`/tenant/receipts/${p.receipt_id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      <ReceiptIcon className="size-3.5" />
                      Voir le reçu
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
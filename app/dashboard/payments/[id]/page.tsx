import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";


import { createClient } from "@/lib/supabase/server";
import { getRentDue } from "@/actions/rent-dues";
import { getRentPayments } from "@/actions/rent-payments";
import { DueStatusBadge } from "@/components/rent-dues/due-status-badge";
import { RecordPaymentDialog } from "@/components/rent-dues/record-payment-dialog";
import { PaymentHistory } from "@/components/rent-dues/payment-history";
import type { DueStatus } from "@/types/database";

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

export default async function RentDueDetailPage({
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
  const result = await getRentDue(id);
  if (!result.success) notFound();

  const due = result.data!;
  const paymentsResult = await getRentPayments(due.id);
  const payments = paymentsResult.success ? paymentsResult.data! : [];


  return (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux paiements
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight capitalize">
                Échéance {new Intl.DateTimeFormat("fr-FR", {
                  month: "long",
                  year: "numeric",
                }).format(new Date(due.period_start))}
              </h1>
              <DueStatusBadge status={due.status as DueStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              Échéance le {formatDate(due.due_date)}
            </p>
          </div>
          {Number(due.amount_remaining) > 0 && (
            <RecordPaymentDialog
              rentDueId={due.id}
              amountRemaining={Number(due.amount_remaining)}
            />
          )}
        </div>
      </div>

      {/* Bloc financier */}
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
            className={
              "font-heading text-lg font-semibold tabular-nums " +
              (Number(due.amount_remaining) > 0 ? "text-[var(--brand)]" : "")
            }
          >
            {formatCurrency(Number(due.amount_remaining))}
          </p>
        </div>
      </div>

      {/* Contexte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Locataire
          </h2>
          <div>
            <Link
              href={`/dashboard/tenants/${due.tenant_id}`}
              className="font-medium hover:underline"
            >
              {due.tenant_first_name} {due.tenant_last_name}
            </Link>
            {due.tenant_phone && (
              <p className="text-sm text-muted-foreground">
                {due.tenant_phone}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Bail
          </h2>
          <div>
            <Link
              href={`/dashboard/leases/${due.lease_id}`}
              className="font-medium hover:underline"
            >
              {due.unit_number} · {due.property_name}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              Bail du {formatDate(due.lease_start_date)} au{" "}
              {due.lease_end_date ? formatDate(due.lease_end_date) : "en cours"}
            </p>
          </div>
        </div>
      </div>

      {/* Historique des paiements */}
      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">
          Historique des paiements
        </h2>
        <PaymentHistory payments={payments} />
      </div>
    </div>
  );
}
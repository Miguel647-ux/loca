import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getLease } from "@/actions/leases";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LeaseStatusBadge } from "@/components/leases/lease-status-badge";
import { EndLeaseDialog } from "@/components/leases/end-lease-dialog";
import type { LeaseStatus } from "@/lib/validations/lease";

export const metadata: Metadata = { title: "Détail bail — Loca" };

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}
function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(n).concat(" FCFA");
}

export default async function LeaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const result = await getLease(id);
  if (!result.success) notFound();

  const lease = result.data!;
  const isEnded = lease.status === "terminated" || lease.status === "expired";

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="space-y-4">
        <Link href="/dashboard/leases" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Retour aux baux
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                Bail — {lease.unit?.unit_number ?? "Logement"}
              </h1>
              <LeaseStatusBadge status={lease.status as LeaseStatus} />
            </div>
            {lease.property && (
              <p className="text-sm text-muted-foreground">{lease.property.name}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isEnded && (
              <Link href={`/dashboard/leases/${lease.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                <Pencil className="size-4" />
                Modifier
              </Link>
            )}
            {!isEnded && lease.tenant && (
              <EndLeaseDialog
                leaseId={lease.id}
                tenantName={`${lease.tenant.first_name} ${lease.tenant.last_name}`}
              />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-4">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">Locataire</h2>
        {lease.tenant ? (
          <div>
            <Link href={`/dashboard/tenants/${lease.tenant.id}`} className="font-medium hover:underline">
              {lease.tenant.first_name} {lease.tenant.last_name}
            </Link>
            {lease.tenant.phone && <p className="text-sm text-muted-foreground mt-0.5">{lease.tenant.phone}</p>}
          </div>
        ) : <p className="text-sm text-muted-foreground">—</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Date de début</p>
          <p className="text-sm font-medium">{formatDate(lease.start_date)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Date de fin</p>
          <p className="text-sm font-medium">{formatDate(lease.end_date)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Loyer mensuel</p>
          <p className="text-sm font-medium tabular-nums">{formatCurrency(Number(lease.monthly_rent))}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Dépôt</p>
          <p className="text-sm font-medium tabular-nums">{formatCurrency(Number(lease.deposit_amount))}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Jour d’échéance</p>
          <p className="text-sm font-medium">Le {lease.payment_due_day} de chaque mois</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">Créé le</p>
          <p className="text-sm font-medium">{formatDate(lease.created_at)}</p>
        </div>
      </div>

      {lease.notes && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-heading text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Notes</h2>
          <p className="text-sm whitespace-pre-wrap">{lease.notes}</p>
        </div>
      )}
    </div>
  );
}
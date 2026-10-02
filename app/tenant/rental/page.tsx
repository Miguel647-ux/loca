import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2, Calendar, CreditCard, DoorOpen, User } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTenantDashboard } from "@/actions/dashboard";
import { EmptyState, ErrorState } from "@/components/states";
import { LeaseStatusBadge } from "@/components/leases/lease-status-badge";
import type { LeaseStatus } from "@/lib/validations/lease";

export const metadata: Metadata = { title: "Mon logement — Loca" };

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}
function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function TenantRentalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const result = await getTenantDashboard();

  if (!result.success) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mon logement
        </h1>
        <ErrorState
          title="Impossible de charger vos informations"
          description={result.error}
        />
      </div>
    );
  }

  const dashboard = result.data!;

  if (!dashboard.linked) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mon logement
        </h1>
        <EmptyState
          icon={DoorOpen}
          title="Compte non associé"
          description="Votre compte n'est pas encore associé à un dossier locataire."
        />
      </div>
    );
  }

  const { tenant, active_lease } = dashboard;

  if (!active_lease) {
    return (
      <div className="space-y-6 max-w-4xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mon logement
        </h1>
        <EmptyState
          icon={DoorOpen}
          title="Aucun bail actif"
          description="Vous n'avez actuellement aucun bail actif."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mon logement
        </h1>
        <p className="text-muted-foreground mt-1">
          Informations sur votre bail actif et votre logement.
        </p>
      </div>

      {/* Logement */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Logement
        </h2>
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex size-11 items-center justify-center rounded-full bg-[var(--brand)]/10 shrink-0">
              <Building2 className="size-5 text-[var(--brand)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-lg font-semibold">
                {active_lease.property_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {active_lease.address}, {active_lease.city}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Logement {active_lease.unit_number}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
            <InfoRow
              label="Loyer mensuel"
              value={formatCurrency(Number(active_lease.monthly_rent))}
            />
            <InfoRow
              label="Échéance"
              value={`Le ${active_lease.payment_due_day}`}
            />
            <InfoRow
              label="Début"
              value={formatDate(active_lease.start_date)}
            />
            <InfoRow label="Fin" value={formatDate(active_lease.end_date)} />
          </div>
        </div>
      </section>

      {/* Bail */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Bail
        </h2>
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Statut du bail</p>
            <LeaseStatusBadge status={active_lease.status as LeaseStatus} />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <InfoRow
              label="Loyer mensuel"
              value={formatCurrency(Number(active_lease.monthly_rent))}
            />
            <InfoRow
              label="Dépôt de garantie"
              value={formatCurrency(Number(active_lease.deposit_amount))}
            />
          </div>
        </div>
      </section>

      {/* Locataire */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Vos coordonnées
        </h2>
        <div className="rounded-lg border bg-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {tenant.first_name} {tenant.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {tenant.phone}
                {tenant.email && ` · ${tenant.email}`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
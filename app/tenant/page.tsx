import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  FileText,
  Home,
  Info,
  Wallet,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/permissions";
import { getTenantDashboard } from "@/actions/dashboard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/states";
import { KpiCard } from "@/components/dashboard/kpi-card";

export const metadata: Metadata = { title: "Mon espace — Loca" };

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
function formatPeriod(start: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(start));
}

const STATUS_LABELS: Record<string, string> = {
  paid: "Payé",
  partial: "Partiel",
  pending: "À payer",
  late: "En retard",
  cancelled: "Annulé",
};

export default async function TenantHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  const result = await getTenantDashboard();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Bonjour{profile ? `, ${profile.first_name}` : ""}
        </h1>
        <ErrorState
          title="Impossible de charger votre espace"
          description={result.error}
        />
      </div>
    );
  }

  const dashboard = result.data!;

  // Cas : compte non lié à un dossier locataire
  if (!dashboard.linked) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Bonjour{profile ? `, ${profile.first_name}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue dans votre espace locataire.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted shrink-0">
              <Info className="size-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Compte non associé</p>
              <p className="text-sm text-muted-foreground">
                Votre compte n’est pas encore associé à un dossier locataire.
                Contactez votre gestionnaire pour qu’il effectue l’association.
              </p>
            </div>
          </div>
        </div>

        <EmptyState
          icon={Home}
          title="Aucune information disponible"
          description="Une fois votre dossier associé, vous pourrez consulter votre logement, votre bail, vos échéances et vos paiements."
        />
      </div>
    );
  }

  // Cas : compte lié
  const { tenant, active_lease, dues, payments, finance, unread_notifications } =
    dashboard;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Bonjour {tenant.first_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre situation locative.
          </p>
        </div>
        <Link
          href="/tenant/notifications"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Bell className="size-4" />
          Notifications
          {unread_notifications > 0 && (
            <span className="ml-1 rounded-full bg-[var(--brand)] px-1.5 text-[10px] text-[var(--brand-foreground)]">
              {unread_notifications}
            </span>
          )}
        </Link>
      </div>

      {/* Logement actif */}
      {active_lease ? (
        <section className="space-y-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Mon logement
          </h2>
          <div className="rounded-lg border bg-card p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-[var(--brand)]/10 shrink-0">
                <Building2 className="size-5 text-[var(--brand)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-lg font-semibold truncate">
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
              <InfoRow label="Loyer mensuel" value={formatCurrency(Number(active_lease.monthly_rent))} />
              <InfoRow label="Échéance" value={`Le ${active_lease.payment_due_day}`} />
              <InfoRow label="Début" value={formatDate(active_lease.start_date)} />
              <InfoRow label="Fin" value={formatDate(active_lease.end_date)} />
            </div>
          </div>
        </section>
      ) : (
        <EmptyState
          icon={DoorOpen}
          title="Aucun bail actif"
          description="Vous n'avez actuellement aucun bail actif."
        />
      )}

      {/* Finance */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Ma situation financière
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label="Total dû"
            value={formatCurrency(Number(finance.total_due))}
          />
          <KpiCard
            label="Payé"
            value={formatCurrency(Number(finance.total_paid))}
          />
          <KpiCard
            label="Restant"
            value={formatCurrency(Number(finance.total_remaining))}
            accent={Number(finance.total_remaining) > 0 ? "brand" : "default"}
          />
          <KpiCard
            label="En retard"
            value={finance.count_late}
            icon={AlertTriangle}
            accent={finance.count_late > 0 ? "destructive" : "default"}
          />
        </div>
      </section>

      {/* Échéances */}
      {dues.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mes échéances
            </h2>
            <Link
              href="/tenant/payments"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Tout voir →
            </Link>
          </div>
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Période</th>
                  <th className="px-4 py-2.5 text-right font-medium">Dû</th>
                  <th className="px-4 py-2.5 text-right font-medium hidden sm:table-cell">
                    Payé
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">Reste</th>
                  <th className="px-4 py-2.5 text-left font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {dues.slice(0, 6).map((d) => (
                  <tr key={d.id} className="border-t">
                    <td className="px-4 py-2.5 capitalize">
                      {formatPeriod(d.period_start)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatCurrency(Number(d.amount_due))}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                      {formatCurrency(Number(d.amount_paid))}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {Number(d.amount_remaining) > 0 ? (
                        <span className="text-[var(--brand)] font-medium">
                          {formatCurrency(Number(d.amount_remaining))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">
                        {STATUS_LABELS[d.status] ?? d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Paiements récents */}
      {payments.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mes paiements récents
            </h2>
            <Link
              href="/tenant/receipts"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Voir mes reçus →
            </Link>
          </div>
          <div className="rounded-lg border bg-card divide-y">
            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-[var(--brand)]/10 shrink-0">
                  {p.receipt_id ? (
                    <CheckCircle2 className="size-4 text-[var(--brand)]" />
                  ) : (
                    <Wallet className="size-4 text-[var(--brand)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium tabular-nums">
                    {formatCurrency(Number(p.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.payment_date)}
                    {p.receipt_number && (
                      <span className="ml-1 font-mono">
                        · {p.receipt_number}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Raccourcis */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <QuickLink
          href="/tenant/rental"
          icon={DoorOpen}
          label="Mon logement"
        />
        <QuickLink
          href="/tenant/payments"
          icon={CalendarClock}
          label="Échéances"
        />
        <QuickLink
          href="/tenant/receipts"
          icon={FileText}
          label="Reçus"
        />
        <QuickLink
          href="/tenant/notifications"
          icon={Bell}
          label="Notifications"
          badge={unread_notifications}
        />
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

function QuickLink({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string;
  icon: typeof Bell;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-sm transition-colors hover:border-foreground/20 hover:bg-muted/30"
    >
      <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-[var(--brand)]/10 group-hover:text-[var(--brand)] transition-colors">
        <Icon className="size-3.5" />
      </div>
      <span className="truncate font-medium flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className="rounded-full bg-[var(--brand)] px-1.5 text-[10px] font-medium text-[var(--brand-foreground)]">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Building2,
  CreditCard,
  DoorOpen,
  FileText,
  Plus,
  Wallet,
} from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/permissions";
import { getOwnerDashboard } from "@/actions/dashboard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/states";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { FinanceSummary } from "@/components/dashboard/finance-summary";
import { ParcSummary } from "@/components/dashboard/parc-summary";
import { RecentPayments } from "@/components/dashboard/recent-payments";
import { LateDues } from "@/components/dashboard/late-dues";

export const metadata: Metadata = { title: "Tableau de bord — Loca" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await getCurrentProfile();
  const result = await getOwnerDashboard();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Bonjour{profile ? `, ${profile.first_name}` : ""}
        </h1>
        <ErrorState
          title="Impossible de charger le tableau de bord"
          description={result.error}
        />
      </div>
    );
  }

  const dashboard = result.data!;
  const { counts, finance, recent_payments, late_dues } = dashboard;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Bonjour{profile ? `, ${profile.first_name}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité locative.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className={cn(buttonVariants())}
        >
          <Plus className="size-4" />
          Nouvelle propriété
        </Link>
      </div>

      {/* Indicateurs principaux */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Vue d’ensemble
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            label="Propriétés"
            value={counts.properties}
            icon={Building2}
          />
          <KpiCard
            label="Logements"
            value={counts.units_total}
            icon={DoorOpen}
          />
          <KpiCard
            label="Occupés"
            value={counts.units_occupied}
            icon={DoorOpen}
            accent="brand"
            hint={
              counts.units_total > 0
                ? `${Math.round(
                    (counts.units_occupied / counts.units_total) * 100
                  )} % du parc`
                : undefined
            }
          />
          <KpiCard
            label="Baux actifs"
            value={counts.leases_active}
            icon={FileText}
          />
        </div>
      </section>

      {/* Finance */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Situation financière
        </h2>
        <FinanceSummary finance={finance} />
        {Number(finance.total_due) > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <KpiCard
              label="Payées"
              value={finance.count_paid}
              icon={Wallet}
            />
            <KpiCard
              label="Partielles"
              value={finance.count_partial}
              icon={CreditCard}
            />
            <KpiCard
              label="En retard"
              value={finance.count_late}
              icon={AlertTriangle}
              accent={finance.count_late > 0 ? "destructive" : "default"}
            />
          </div>
        )}
      </section>

      {/* Parc immobilier */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Parc immobilier
        </h2>
        <ParcSummary counts={counts} />
      </section>

      {/* Activité financière */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Paiements récents
          </h2>
          <RecentPayments payments={recent_payments} />
        </div>
        <div className="space-y-3">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Échéances en retard
          </h2>
          <LateDues dues={late_dues} />
        </div>
      </section>

      {/* Raccourcis */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Actions rapides
        </h2>
        <QuickActions />
      </section>
    </div>
  );
}
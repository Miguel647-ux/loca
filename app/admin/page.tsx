import { getAdminStats } from "@/actions/admin";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Users, Building2, DoorOpen, FileText, TrendingUp, Wallet } from "lucide-react";
import { ErrorState } from "@/components/states";
import { AdminCharts } from "@/components/admin/admin-charts";

export default async function AdminDashboardPage() {
  const result = await getAdminStats();

  if (!result.success) {
    return <ErrorState title="Erreur" description={result.error} />;
  }

  const stats = result.data;

  const formatFCFA = (amount: number) => 
    new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 }).format(amount) + " FCFA";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Administration LOCA</h1>
        <p className="text-muted-foreground mt-1">Supervision globale de la plateforme.</p>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Utilisateurs" value={stats.users.total} icon={Users} hint={`${stats.users.owners} owners, ${stats.users.tenants} tenants`} />
        <KpiCard label="Propriétés" value={stats.properties} icon={Building2} />
        <KpiCard label="Logements" value={stats.units} icon={DoorOpen} />
        <KpiCard label="Baux actifs" value={stats.leases.active} icon={FileText} />
      </div>

      {/* Finances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Volume total encaissé</p>
            <p className="font-heading text-3xl font-bold tabular-nums text-[var(--brand)]">
              {formatFCFA(stats.finance.total_collected)}
            </p>
          </div>
          <div className="size-12 rounded-full bg-[var(--brand)]/10 flex items-center justify-center">
            <Wallet className="size-6 text-[var(--brand)]" />
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Reste à percevoir (global)</p>
            <p className="font-heading text-3xl font-bold tabular-nums">
              {formatFCFA(stats.finance.total_pending)}
            </p>
          </div>
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <TrendingUp className="size-6 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <AdminCharts 
        usersHistory={stats.charts.users_history} 
        revenueHistory={stats.charts.revenue_history} 
      />
    </div>
  );
}
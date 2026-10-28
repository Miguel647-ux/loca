import { getAdminStats } from "@/actions/admin";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Users, Building2, DoorOpen, FileText, CreditCard } from "lucide-react";
import { ErrorState } from "@/components/states";

export default async function AdminDashboardPage() {
  const result = await getAdminStats();

  if (!result.success) {
    return <ErrorState title="Erreur" description={result.error} />;
  }

  const stats = result.data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Administration LOCA</h1>
        <p className="text-muted-foreground mt-1">Supervision globale de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Utilisateurs" value={stats.users.total} icon={Users} hint={`${stats.users.owners} owners, ${stats.users.tenants} tenants`} />
        <KpiCard label="Propriétés" value={stats.properties} icon={Building2} />
        <KpiCard label="Logements" value={stats.units} icon={DoorOpen} />
        <KpiCard label="Baux actifs" value={stats.leases.active} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Volume total encaissé</p>
          <p className="font-heading text-3xl font-bold tabular-nums text-[var(--brand)]">
            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(stats.finance.total_collected)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground mb-2">Reste à percevoir (global)</p>
          <p className="font-heading text-3xl font-bold tabular-nums">
            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(stats.finance.total_pending)}
          </p>
        </div>
      </div>
    </div>
  );
}
import { ArrowDownRight, ArrowUpRight, Scale } from "lucide-react";

import type { OwnerDashboardFinance } from "@/types/dashboard";
import { KpiCard } from "./kpi-card";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}

export function FinanceSummary({ finance }: { finance: OwnerDashboardFinance }) {
  const hasData = finance.total_due > 0 || finance.total_paid > 0;

  if (!hasData) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
        Aucune activité financière enregistrée pour le moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <KpiCard
        label="Total dû"
        value={formatCurrency(Number(finance.total_due))}
        icon={Scale}
      />
      <KpiCard
        label="Encaissé"
        value={formatCurrency(Number(finance.total_paid))}
        icon={ArrowUpRight}
      />
      <KpiCard
        label="Restant à percevoir"
        value={formatCurrency(Number(finance.total_remaining))}
        icon={ArrowDownRight}
        accent={Number(finance.total_remaining) > 0 ? "brand" : "default"}
        hint={
          Number(finance.total_remaining) > 0
            ? `${finance.count_late + finance.count_partial + finance.count_pending} échéance(s) ouverte(s)`
            : undefined
        }
      />
    </div>
  );
}
import type { RentDuesStats } from "@/types/database";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}

export function RentDueStats({ stats }: { stats: RentDuesStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Total dû" value={formatCurrency(stats.total_due)} />
      <StatCard label="Encaissé" value={formatCurrency(stats.total_paid)} />
      <StatCard
        label="Restant"
        value={formatCurrency(stats.total_remaining)}
        highlight={stats.total_remaining > 0}
      />
      <StatCard
        label="En retard"
        value={String(stats.count_late)}
        hint={stats.count_late > 0 ? "à relancer" : undefined}
        alert={stats.count_late > 0}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  highlight,
  alert,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p
        className={
          "font-heading text-lg font-semibold tabular-nums " +
          (alert ? "text-destructive" : highlight ? "text-[var(--brand)]" : "")
        }
      >
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}
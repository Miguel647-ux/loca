import { DoorOpen } from "lucide-react";
import type { Unit } from "@/types/database";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .concat(" FCFA");
}

export function UnitStats({ units }: { units: Unit[] }) {
  const total = units.length;
  const available = units.filter((u) => u.status === "available").length;
  const occupied = units.filter((u) => u.status === "occupied").length;
  const maintenance = units.filter((u) => u.status === "maintenance").length;

  // Revenu mensuel potentiel = somme des loyers de toutes les unités
  // (hors maintenance, car non louables en l'état)
  const potentialRevenue = units
    .filter((u) => u.status !== "maintenance")
    .reduce((sum, u) => sum + Number(u.monthly_rent), 0);

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Total" value={String(total)} />
      <StatCard label="Disponibles" value={String(available)} />
      <StatCard label="Occupés" value={String(occupied)} />
      <StatCard
        label="Revenu potentiel"
        value={formatCurrency(potentialRevenue)}
        hint="hors maintenance"
      />
      {maintenance > 0 && (
        <StatCard
          label="En maintenance"
          value={String(maintenance)}
          className="col-span-2 sm:col-span-1"
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-card p-4 ${className ?? ""}`}>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-heading text-lg font-semibold tabular-nums">
        {value}
      </p>
      {hint && (
        <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>
      )}
    </div>
  );
}
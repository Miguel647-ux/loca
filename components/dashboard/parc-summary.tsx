import Link from "next/link";
import { Building2, DoorOpen } from "lucide-react";

import type { OwnerDashboardCounts } from "@/types/dashboard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ParcSummary({ counts }: { counts: OwnerDashboardCounts }) {
  if (counts.properties === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Aucun bien enregistré</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commencez par créer votre première propriété.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          <Building2 className="size-4" />
          Créer une propriété
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted">
            <Building2 className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {counts.properties}{" "}
              {counts.properties > 1 ? "propriétés" : "propriété"}
            </p>
            <p className="text-xs text-muted-foreground">
              {counts.units_total} logement
              {counts.units_total > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/properties"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Voir
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <UnitStat
          label="Disponibles"
          value={counts.units_available}
          variant="outline"
        />
        <UnitStat
          label="Occupés"
          value={counts.units_occupied}
          variant="brand"
        />
        <UnitStat
          label="Maintenance"
          value={counts.units_maintenance}
          variant="muted"
        />
      </div>
    </div>
  );
}

function UnitStat({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "outline" | "brand" | "muted";
}) {
  const colorClass =
    variant === "brand"
      ? "text-[var(--brand)]"
      : variant === "muted"
        ? "text-muted-foreground"
        : "";

  return (
    <div className="rounded-md border bg-background p-3 text-center">
      <p className={cn("font-heading text-xl font-semibold tabular-nums", colorClass)}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5 flex items-center justify-center gap-1">
        <DoorOpen className="size-2.5" />
        {label}
      </p>
    </div>
  );
}
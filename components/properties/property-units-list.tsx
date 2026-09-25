import { DoorOpen } from "lucide-react";

import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import type { Unit, UnitStatus } from "@/types/database";

const STATUS_LABELS: Record<UnitStatus, string> = {
  available: "Disponible",
  occupied: "Occupé",
  maintenance: "Maintenance",
};

const STATUS_VARIANTS: Record<
  UnitStatus,
  "default" | "secondary" | "outline"
> = {
  available: "outline",
  occupied: "default",
  maintenance: "secondary",
};

function formatRent(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .concat(" FCFA");
}

export function PropertyUnitsList({ units }: { units: Unit[] }) {
  if (units.length === 0) {
    return (
      <EmptyState
        icon={DoorOpen}
        title="Aucun logement"
        description="Cette propriété n'a encore aucun logement enregistré."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Numéro</th>
            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">
              Type
            </th>
            <th className="px-4 py-3 text-right font-medium">Loyer</th>
            <th className="px-4 py-3 text-left font-medium">Statut</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr
              key={unit.id}
              className="border-t transition-colors hover:bg-muted/20"
            >
              <td className="px-4 py-3 font-medium">{unit.unit_number}</td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell capitalize">
                {unit.unit_type}
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatRent(unit.monthly_rent)}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANTS[unit.status]}>
                  {STATUS_LABELS[unit.status]}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
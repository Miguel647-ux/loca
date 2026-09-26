import Link from "next/link";
import { DoorOpen, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UnitStatusBadge } from "./unit-status-badge";
import { DeleteUnitDialog } from "./delete-unit-dialog";
import {
  UNIT_TYPE_LABELS,
  type UnitStatus,
  type UnitType,
} from "@/lib/validations/unit";
import type { Unit } from "@/types/database";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .concat(" FCFA");
}

export function UnitCard({
  unit,
  propertyId,
}: {
  unit: Unit;
  propertyId: string;
}) {
  const typeLabel = UNIT_TYPE_LABELS[unit.unit_type as UnitType] ?? unit.unit_type;
  const statusLabel = unit.status as UnitStatus;

  return (
    <div className="rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <DoorOpen className="size-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-heading font-semibold truncate">
              {unit.unit_number}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {typeLabel}
            </p>
          </div>
        </div>
        <UnitStatusBadge status={statusLabel} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Loyer mensuel</p>
          <p className="font-medium tabular-nums">
            {formatCurrency(Number(unit.monthly_rent))}
          </p>
        </div>
        {(unit.floor !== null || unit.area_m2 !== null) && (
          <div>
            <p className="text-muted-foreground">Détails</p>
            <p className="font-medium">
              {unit.floor !== null && `Étage ${unit.floor}`}
              {unit.floor !== null && unit.area_m2 !== null && " · "}
              {unit.area_m2 !== null && `${unit.area_m2} m²`}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          href={`/dashboard/properties/${propertyId}/units/${unit.id}/edit`}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "flex-1"
          )}
        >
          <Pencil className="size-3.5" />
          Modifier
        </Link>
        <DeleteUnitDialog
          unitId={unit.id}
          unitNumber={unit.unit_number}
          propertyId={propertyId}
        />
      </div>
    </div>
  );
}
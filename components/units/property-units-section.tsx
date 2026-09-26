import Link from "next/link";
import { DoorOpen, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { UnitCard } from "./unit-card";
import { UnitStats } from "./unit-stats";
import type { Unit } from "@/types/database";

export function PropertyUnitsSection({
  units,
  propertyId,
  isArchived,
}: {
  units: Unit[];
  propertyId: string;
  isArchived: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Logements</h2>
          <p className="text-sm text-muted-foreground">
            {units.length} {units.length > 1 ? "logements" : "logement"} dans
            cette propriété
          </p>
        </div>
        {!isArchived && (
          <Link
            href={`/dashboard/properties/${propertyId}/units/new`}
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="size-4" />
            Nouveau logement
          </Link>
        )}
      </div>

      {units.length > 0 && <UnitStats units={units} />}

      {units.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="Aucun logement"
          description="Cette propriété n'a encore aucun logement enregistré."
          action={
            !isArchived && (
              <Link
                href={`/dashboard/properties/${propertyId}/units/new`}
                className={cn(buttonVariants())}
              >
                Ajouter un logement
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} propertyId={propertyId} />
          ))}
        </div>
      )}
    </div>
  );
}
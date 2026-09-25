import { Building2 } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/states";
import { PropertyCard } from "./property-card";
import type { PropertyWithStats } from "@/types/database";

export function PropertyList({
  items,
  coverUrls,
  hasFilters,
}: {
  items: PropertyWithStats[];
  coverUrls: Record<string, string>;
  hasFilters: boolean;
}) {
  if (items.length === 0) {
    if (hasFilters) {
      return (
        <EmptyState
          icon={Building2}
          title="Aucun résultat"
          description="Aucune propriété ne correspond à votre recherche."
        />
      );
    }

    return (
      <EmptyState
        icon={Building2}
        title="Aucune propriété"
        description="Vous n'avez encore ajouté aucune propriété."
        action={
          <Link
            href="/dashboard/properties/new"
            className={cn(buttonVariants())}
          >
            Ajouter une propriété
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          coverUrl={coverUrls[property.id] ?? null}
        />
      ))}
    </div>
  );
}
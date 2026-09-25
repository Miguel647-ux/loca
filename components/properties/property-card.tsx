import Link from "next/link";
import { Building2, DoorOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { PropertyWithStats } from "@/types/database";

export function PropertyCard({
  property,
  coverUrl,
}: {
  property: PropertyWithStats;
  coverUrl?: string | null;
}) {
  const isArchived = property.status === "archived";

  return (
    <div className="group overflow-hidden rounded-lg border bg-card transition-colors hover:border-foreground/20">
      {/* Image de couverture */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={property.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Building2 className="size-8 text-muted-foreground/60" />
          </div>
        )}

        {isArchived && (
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            Archivée
          </span>
        )}
      </div>

      {/* Contenu */}
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <h3 className="font-heading text-lg font-semibold leading-tight line-clamp-1">
            {property.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {property.district ? `${property.district}, ` : ""}
            {property.city}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <DoorOpen className="size-3.5" />
            {property.units_count}{" "}
            {property.units_count > 1 ? "logements" : "logement"}
          </span>
          {property.units_occupied > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--brand)]" />
              {property.units_occupied} occupé
              {property.units_occupied > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="pt-1">
          <Link
            href={`/dashboard/properties/${property.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-full"
            )}
          >
            Voir le détail
          </Link>
        </div>
      </div>
    </div>
  );
}
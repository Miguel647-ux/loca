import Link from "next/link";
import { FileText, Plus, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { LeaseStatusBadge } from "./lease-status-badge";
import type { LeaseStatus } from "@/lib/validations/lease";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 })
    .format(amount).concat(" FCFA");
}

export type ActiveLeasePanelData = {
  id: string;
  start_date: string;
  end_date: string | null;
  monthly_rent: number;
  deposit_amount: number;
  payment_due_day: number;
  status: string;
  tenant: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
};

export function ActiveLeasePanel({
  unitId,
  propertyId,
  activeLease,
}: {
  unitId: string;
  propertyId: string;
  activeLease: ActiveLeasePanelData | null;
}) {
  if (!activeLease) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted shrink-0">
            <FileText className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium">Aucun bail actif</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ce logement n’a pas de bail actif. Créez-en un pour associer un locataire.
              </p>
            </div>
            <Link
              href={`/dashboard/leases/new?unit_id=${unitId}`}
              className={cn(buttonVariants({ size: "sm" }))}
            >
              <Plus className="size-4" />
              Créer un bail
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
            <User className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {activeLease.tenant
                ? `${activeLease.tenant.first_name} ${activeLease.tenant.last_name}`
                : "Locataire supprimé"}
            </p>
            {activeLease.tenant?.phone && (
              <p className="text-xs text-muted-foreground">{activeLease.tenant.phone}</p>
            )}
          </div>
        </div>
        <LeaseStatusBadge status={activeLease.status as LeaseStatus} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Début</p>
          <p className="font-medium">
            {new Date(activeLease.start_date).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Fin</p>
          <p className="font-medium">
            {activeLease.end_date
              ? new Date(activeLease.end_date).toLocaleDateString("fr-FR")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Loyer</p>
          <p className="font-medium tabular-nums">
            {formatCurrency(Number(activeLease.monthly_rent))}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Échéance</p>
          <p className="font-medium">le {activeLease.payment_due_day}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Link
          href={`/dashboard/leases/${activeLease.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Voir le bail
        </Link>
      </div>
    </div>
  );
}
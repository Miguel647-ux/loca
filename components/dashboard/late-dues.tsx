import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OwnerDashboardLateDue } from "@/types/dashboard";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}

function formatPeriod(start: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(new Date(start));
}

export function LateDues({ dues }: { dues: OwnerDashboardLateDue[] }) {
  if (dues.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-5 text-center text-sm text-muted-foreground">
        Aucune échéance en retard. Tout est à jour.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card divide-y">
      {dues.map((d) => (
        <Link
          key={d.id}
          href={`/dashboard/payments/${d.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {d.tenant_first_name} {d.tenant_last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {formatPeriod(d.period_start)} · {d.days_late} jour
              {d.days_late > 1 ? "s" : ""} de retard
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium tabular-nums text-destructive">
              {formatCurrency(Number(d.amount_remaining))}
            </p>
            <p className="text-xs text-muted-foreground">restant</p>
          </div>
        </Link>
      ))}
      <div className="p-2 bg-muted/20">
        <Link
          href="/dashboard/payments?status=late"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full"
          )}
        >
          Voir toutes les échéances en retard
        </Link>
      </div>
    </div>
  );
}
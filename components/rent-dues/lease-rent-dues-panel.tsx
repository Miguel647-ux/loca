import Link from "next/link";
import { Plus, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DueStatusBadge } from "./due-status-badge";
import type { RentDueListItem, DueStatus } from "@/types/database";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}

function formatPeriod(start: string) {
  const s = new Date(start);
  return new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(s);
}

export function LeaseRentDuesPanel({
  leaseId,
  dues,
}: {
  leaseId: string;
  dues: RentDueListItem[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold">Loyers dus</h2>
        <Link
          href={`/dashboard/payments/new?lease_id=${leaseId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Plus className="size-4" />
          Ajouter une échéance
        </Link>
      </div>

      {dues.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Receipt className="size-5" />
            <p className="text-sm">
              Aucune échéance enregistrée pour ce bail.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Période</th>
                <th className="px-4 py-3 text-right font-medium">Dû</th>
                <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">
                  Payé
                </th>
                <th className="px-4 py-3 text-right font-medium">Reste</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dues.map((d) => (
                <tr key={d.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 capitalize">
                    {formatPeriod(d.period_start)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(Number(d.amount_due))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell text-muted-foreground">
                    {formatCurrency(Number(d.amount_paid))}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {Number(d.amount_remaining) > 0 ? (
                      <span className="text-[var(--brand)] font-medium">
                        {formatCurrency(Number(d.amount_remaining))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <DueStatusBadge status={d.status as DueStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/payments/${d.id}`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import Link from "next/link";
import { Receipt } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
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

function formatPeriod(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  if (
    s.getUTCFullYear() === e.getUTCFullYear() &&
    s.getUTCMonth() === e.getUTCMonth()
  ) {
    return new Intl.DateTimeFormat("fr-FR", opts).format(s);
  }
  return `${new Intl.DateTimeFormat("fr-FR", opts).format(s)} → ${new Intl.DateTimeFormat("fr-FR", opts).format(e)}`;
}

export function RentDueList({
  items,
  hasFilters,
}: {
  items: RentDueListItem[];
  hasFilters: boolean;
}) {
  if (items.length === 0) {
    if (hasFilters) {
      return (
        <EmptyState
          icon={Receipt}
          title="Aucun résultat"
          description="Aucune échéance ne correspond à votre recherche."
        />
      );
    }
    return (
      <EmptyState
        icon={Receipt}
        title="Aucune échéance"
        description="Vous n'avez encore enregistré aucune échéance de loyer."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Période</th>
            <th className="px-4 py-3 text-left font-medium hidden md:table-cell">
              Locataire
            </th>
            <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">
              Logement
            </th>
            <th className="px-4 py-3 text-right font-medium">Dû</th>
            <th className="px-4 py-3 text-right font-medium hidden sm:table-cell">
              Reste
            </th>
            <th className="px-4 py-3 text-left font-medium">Statut</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((due) => (
            <tr key={due.id} className="border-t hover:bg-muted/20">
              <td className="px-4 py-3">
                <div className="font-medium capitalize">
                  {formatPeriod(due.period_start, due.period_end)}
                </div>
                <div className="text-xs text-muted-foreground">
                  échéance{" "}
                  {new Date(due.due_date).toLocaleDateString("fr-FR")}
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Link
                  href={`/dashboard/tenants/${due.tenant_id}`}
                  className="hover:underline"
                >
                  {due.tenant_first_name} {due.tenant_last_name}
                </Link>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                {due.unit_number}
                <span className="text-xs"> · {due.property_name}</span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatCurrency(Number(due.amount_due))}
              </td>
              <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell">
                {Number(due.amount_remaining) > 0 ? (
                  <span className="text-[var(--brand)] font-medium">
                    {formatCurrency(Number(due.amount_remaining))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <DueStatusBadge status={due.status as DueStatus} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/payments/${due.id}`}
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
  );
}
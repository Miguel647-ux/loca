import Link from "next/link";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import { LeaseStatusBadge } from "./lease-status-badge";
import type { LeaseWithRelations } from "@/types/database";
import type { LeaseStatus } from "@/lib/validations/lease";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "decimal", maximumFractionDigits: 0 })
    .format(amount).concat(" FCFA");
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export function LeaseList({
  items,
  hasFilters,
}: {
  items: LeaseWithRelations[];
  hasFilters: boolean;
}) {
  if (items.length === 0) {
    if (hasFilters) {
      return (
        <EmptyState
          icon={FileText}
          title="Aucun résultat"
          description="Aucun bail ne correspond à votre recherche."
        />
      );
    }
    return (
      <EmptyState
        icon={FileText}
        title="Aucun bail"
        description="Vous n'avez encore enregistré aucun bail."
        action={
          <Link href="/dashboard/leases/new" className={cn(buttonVariants())}>
            Créer un bail
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Locataire</th>
            <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Logement</th>
            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Période</th>
            <th className="px-4 py-3 text-right font-medium">Loyer</th>
            <th className="px-4 py-3 text-left font-medium">Statut</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((lease) => (
            <tr key={lease.id} className="border-t transition-colors hover:bg-muted/20">
              <td className="px-4 py-3">
                {lease.tenant ? (
                  <Link href={`/dashboard/tenants/${lease.tenant.id}`} className="font-medium hover:underline">
                    {lease.tenant.first_name} {lease.tenant.last_name}
                  </Link>
                ) : <span className="text-muted-foreground/60">—</span>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className="text-muted-foreground">
                  {lease.unit?.unit_number ?? "—"}
                  {lease.property && <span className="text-xs"> · {lease.property.name}</span>}
                </span>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-muted-foreground text-xs">
                  {formatDate(lease.start_date)}
                  {" → "}
                  {lease.end_date ? formatDate(lease.end_date) : "en cours"}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {formatCurrency(Number(lease.monthly_rent))}
              </td>
              <td className="px-4 py-3">
                <LeaseStatusBadge status={lease.status as LeaseStatus} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/leases/${lease.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
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
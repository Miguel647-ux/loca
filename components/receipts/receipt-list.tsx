import Link from "next/link";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import type { GetReceiptsResult } from "@/actions/receipts";

function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ReceiptList({
  items,
  hasFilters,
}: {
  items: GetReceiptsResult["items"];
  hasFilters: boolean;
}) {
  if (items.length === 0) {
    if (hasFilters) {
      return (
        <EmptyState
          icon={FileText}
          title="Aucun résultat"
          description="Aucun reçu ne correspond à votre recherche."
        />
      );
    }
    return (
      <EmptyState
        icon={FileText}
        title="Aucun reçu"
        description="Les reçus sont générés depuis la page d'un paiement enregistré."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">N° reçu</th>
            <th className="px-4 py-3 text-left font-medium hidden md:table-cell">
              Locataire
            </th>
            <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">
              Logement
            </th>
            <th className="px-4 py-3 text-right font-medium">Montant</th>
            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">
              Date
            </th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-t hover:bg-muted/20">
              <td className="px-4 py-3 font-mono text-xs">
                {r.receipt_number}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Link
                  href={`/dashboard/tenants/${r.tenant_id}`}
                  className="hover:underline"
                >
                  {r.tenant_first_name} {r.tenant_last_name}
                </Link>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                {r.unit_number}
                <span className="text-xs"> · {r.property_name}</span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-medium">
                {formatCurrency(Number(r.payment_amount))}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                {formatDate(r.issued_at)}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/receipts/${r.id}`}
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
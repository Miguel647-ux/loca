import Link from "next/link";
import { CreditCard } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OwnerDashboardRecentPayment } from "@/types/dashboard";

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

export function RecentPayments({
  payments,
}: {
  payments: OwnerDashboardRecentPayment[];
}) {
  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 p-5 text-center text-sm text-muted-foreground">
        Aucun paiement récent.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card divide-y">
      {payments.map((p) => (
        <Link
          key={p.id}
          href={`/dashboard/payments/${p.rent_due_id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-[var(--brand)]/10">
            <CreditCard className="size-4 text-[var(--brand)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {p.tenant_first_name} {p.tenant_last_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {p.unit_number} · {p.property_name}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-medium tabular-nums">
              {formatCurrency(Number(p.amount))}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(p.payment_date)}
            </p>
          </div>
        </Link>
      ))}
      <div className="p-2 bg-muted/20">
        <Link
          href="/dashboard/payments"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "w-full"
          )}
        >
          Voir tous les paiements
        </Link>
      </div>
    </div>
  );
}
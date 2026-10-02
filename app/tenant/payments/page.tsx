import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTenantRentDues } from "@/actions/tenant-portal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/states";
import { TenantDueStatusBadge } from "@/components/tenant-portal/due-status-badge";
import { TenantPagination } from "@/components/tenant-portal/tenant-pagination";

export const metadata: Metadata = { title: "Mes échéances — Loca" };

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
  const fmt: Intl.DateTimeFormatOptions = { month: "short", year: "numeric" };
  if (
    s.getUTCFullYear() === e.getUTCFullYear() &&
    s.getUTCMonth() === e.getUTCMonth()
  ) {
    return new Intl.DateTimeFormat("fr-FR", fmt).format(s);
  }
  return `${new Intl.DateTimeFormat("fr-FR", fmt).format(s)} → ${new Intl.DateTimeFormat("fr-FR", fmt).format(e)}`;
}

export default async function TenantPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const raw = await searchParams;
  const page = Number(typeof raw.page === "string" ? raw.page : "1") || 1;

  const result = await getTenantRentDues({ page, pageSize: 20 });

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mes échéances
        </h1>
        <ErrorState title="Impossible de charger vos échéances" description={result.error} />
      </div>
    );
  }

  const { items, total, pageSize } = result.data!;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mes échéances
        </h1>
        <p className="text-muted-foreground mt-1">
          Historique complet de vos obligations de loyer.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Aucune échéance"
          description="Aucune échéance n'a encore été créée pour votre bail."
        />
      ) : (
        <>
          <div className="rounded-lg border bg-card overflow-hidden">
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
                {items.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3 capitalize">
                      {formatPeriod(d.period_start, d.period_end)}
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
                      <TenantDueStatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/tenant/payments/${d.id}`}
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

          <TenantPagination page={page} pageSize={pageSize} total={total} />
        </>
      )}
    </div>
  );
}
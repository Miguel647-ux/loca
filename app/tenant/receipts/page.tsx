import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTenantReceipts } from "@/actions/tenant-portal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/states";
import { TenantPagination } from "@/components/tenant-portal/tenant-pagination";

export const metadata: Metadata = { title: "Mes reçus — Loca" };

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

export default async function TenantReceiptsPage({
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

  const result = await getTenantReceipts({ page, pageSize: 20 });

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mes reçus
        </h1>
        <ErrorState title="Impossible de charger vos reçus" description={result.error} />
      </div>
    );
  }

  const { items, total, pageSize } = result.data!;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mes reçus
        </h1>
        <p className="text-muted-foreground mt-1">
          Consultez et téléchargez vos reçus de paiement.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun reçu"
          description="Aucun reçu n'a encore été émis pour vos paiements."
        />
      ) : (
        <>
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">N° reçu</th>
                  <th className="px-4 py-3 text-left font-medium hidden md:table-cell">
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
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
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
                        href={`/tenant/receipts/${r.id}`}
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
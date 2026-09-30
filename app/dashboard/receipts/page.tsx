
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getReceipts } from "@/actions/receipts";
import { receiptSearchSchema } from "@/lib/validations/receipt";
import { ErrorState } from "@/components/states";
import { ReceiptSearch } from "@/components/receipts/receipt-search";
import { ReceiptList } from "@/components/receipts/receipt-list";
import { ReceiptPagination } from "@/components/receipts/receipt-pagination";

export const metadata: Metadata = { title: "Reçus — Loca" };

export default async function ReceiptsPage({
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
  const parsed = receiptSearchSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    page: typeof raw.page === "string" ? raw.page : "1",
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : "20",
  });
  const params = parsed.success
    ? parsed.data
    : { q: "", page: 1, pageSize: 20 };

  const result = await getReceipts(params);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Reçus
        </h1>
        <ErrorState
          title="Impossible de charger les reçus"
          description={result.error}
        />
      </div>
    );
  }

  const { items, total, page, pageSize } = result.data!;
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Reçus
        </h1>
        <p className="text-muted-foreground mt-1">
          Consultez les reçus émis pour vos paiements enregistrés.
        </p>
      </div>

      <ReceiptSearch />
      <ReceiptList items={items} hasFilters={hasFilters} />
      <ReceiptPagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getRentDues, getRentDuesStats } from "@/actions/rent-dues";
import { rentDueSearchSchema } from "@/lib/validations/rent-due";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/states";
import { RentDueSearch } from "@/components/rent-dues/rent-due-search";
import { RentDueList } from "@/components/rent-dues/rent-due-list";
import { RentDuePagination } from "@/components/rent-dues/rent-due-pagination";
import { RentDueStats } from "@/components/rent-dues/rent-due-stats";

export const metadata: Metadata = { title: "Paiements — Loca" };

export default async function PaymentsPage({
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
  const parsed = rentDueSearchSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    status: typeof raw.status === "string" ? raw.status : "all",
    page: typeof raw.page === "string" ? raw.page : "1",
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : "20",
  });
  const params = parsed.success
    ? parsed.data
    : { q: "", status: "all", page: 1, pageSize: 20 };

  const [listResult, statsResult] = await Promise.all([
    getRentDues(params),
    getRentDuesStats(),
  ]);

  if (!listResult.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Paiements
        </h1>
        <ErrorState
          title="Impossible de charger les échéances"
          description={listResult.error}
        />
      </div>
    );
  }

  const { items, total, page, pageSize } = listResult.data!;
  const hasFilters = Boolean(params.q) || params.status !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Paiements
          </h1>
          <p className="text-muted-foreground mt-1">
            Suivi des loyers dus et des paiements enregistrés.
          </p>
        </div>
        <Link href="/dashboard/payments/new" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          Nouvelle échéance
        </Link>
      </div>

      {statsResult.success && statsResult.data && (
        <RentDueStats stats={statsResult.data} />
      )}

      <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
        Paiement en ligne bientôt disponible. Pour le moment, les paiements sont
        enregistrés manuellement par le gestionnaire.
      </div>

      <RentDueSearch />
      <RentDueList items={items} hasFilters={hasFilters} />
      <RentDuePagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
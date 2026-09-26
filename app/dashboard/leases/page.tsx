import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getLeases } from "@/actions/leases";
import { leaseSearchSchema } from "@/lib/validations/lease";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/states";
import { LeaseSearch } from "@/components/leases/lease-search";
import { LeaseList } from "@/components/leases/lease-list";
import { LeasePagination } from "@/components/leases/lease-pagination";

export const metadata: Metadata = { title: "Baux — Loca" };

export default async function LeasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const raw = await searchParams;
  const parsed = leaseSearchSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    status: typeof raw.status === "string" ? raw.status : "all",
    page: typeof raw.page === "string" ? raw.page : "1",
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : "12",
  });
  const params = parsed.success ? parsed.data : { q: "", status: "all", page: 1, pageSize: 12 };

  const result = await getLeases(params);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Baux</h1>
        <ErrorState title="Impossible de charger les baux" description={result.error} />
      </div>
    );
  }

  const { items, total, page, pageSize } = result.data!;
  const hasFilters = Boolean(params.q) || params.status !== "all";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Baux</h1>
          <p className="text-muted-foreground mt-1">Gérez les baux de vos logements.</p>
        </div>
        <Link href="/dashboard/leases/new" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          Nouveau bail
        </Link>
      </div>

      <LeaseSearch />
      <LeaseList items={items} hasFilters={hasFilters} />
      <LeasePagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
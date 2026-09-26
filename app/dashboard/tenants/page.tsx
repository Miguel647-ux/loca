import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getTenants } from "@/actions/tenants";
import { tenantSearchSchema } from "@/lib/validations/tenant";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/states";
import { TenantSearch } from "@/components/tenants/tenant-search";
import { TenantList } from "@/components/tenants/tenant-list";
import { TenantPagination } from "@/components/tenants/tenant-pagination";

export const metadata: Metadata = { title: "Locataires — Loca" };

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const raw = await searchParams;
  const parsed = tenantSearchSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    page: typeof raw.page === "string" ? raw.page : "1",
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : "12",
  });
  const params = parsed.success ? parsed.data : { q: "", page: 1, pageSize: 12 };

  const result = await getTenants(params);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Locataires</h1>
        <ErrorState title="Impossible de charger les locataires" description={result.error} />
      </div>
    );
  }

  const { items, total, page, pageSize } = result.data!;
  const hasFilters = Boolean(params.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Locataires</h1>
          <p className="text-muted-foreground mt-1">Gérez vos locataires et leurs coordonnées.</p>
        </div>
        <Link href="/dashboard/tenants/new" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          Nouveau locataire
        </Link>
      </div>

      <TenantSearch />
      <TenantList items={items} hasFilters={hasFilters} />
      <TenantPagination page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProperties } from "@/actions/properties";
import { getPropertyImagesSignedUrls } from "@/actions/property-images";
import { propertySearchSchema } from "@/lib/validations/property";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ErrorState } from "@/components/states";
import { PropertySearch } from "@/components/properties/property-search";
import { PropertyList } from "@/components/properties/property-list";
import { PropertyPagination } from "@/components/properties/property-pagination";

export const metadata: Metadata = {
  title: "Propriétés — Loca",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Parse + valide les search params (page, pageSize, q, status)
  const raw = await searchParams;
  const parsed = propertySearchSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : "",
    page: typeof raw.page === "string" ? raw.page : "1",
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : "12",
    status: typeof raw.status === "string" ? raw.status : "active",
  });

  const params = parsed.success
    ? parsed.data
    : { q: "", page: 1, pageSize: 12, status: "active" as const };

  const result = await getProperties(params);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Propriétés
          </h1>
        </div>
        <ErrorState
          title="Impossible de charger les propriétés"
          description={result.error}
        />
      </div>
    );
  }

  const { items, total, page, pageSize } = result.data!;

  // Génère les signed URLs pour la première image de chaque propriété
  const coverPaths = items
    .map((p) => p.property_images?.[0]?.storage_path)
    .filter((x): x is string => Boolean(x));

  let coverUrls: Record<string, string> = {};
  if (coverPaths.length > 0) {
    const signed = await getPropertyImagesSignedUrls(coverPaths);
    if (signed.success && signed.data) {
      const urlByPath = signed.data.urls;
      for (const p of items) {
        const first = p.property_images?.[0];
        if (first && urlByPath[first.storage_path]) {
          coverUrls[p.id] = urlByPath[first.storage_path];
        }
      }
    }
  }

  const hasFilters = Boolean(params.q) || params.status !== "active";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Propriétés
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos biens immobiliers.
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className={cn(buttonVariants())}
        >
          <Plus className="size-4" />
          Nouvelle propriété
        </Link>
      </div>

      <PropertySearch />

      <PropertyList
        items={items}
        coverUrls={coverUrls}
        hasFilters={hasFilters}
      />

      <PropertyPagination
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </div>
  );
}
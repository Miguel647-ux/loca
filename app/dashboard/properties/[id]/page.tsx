import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getProperty } from "@/actions/properties";
import { getPropertyImagesSignedUrls } from "@/actions/property-images";
import { PropertyImageGallery } from "@/components/properties/property-image-gallery";
import { PropertyImageUpload } from "@/components/properties/property-image-upload";
import { PropertyImageManager } from "@/components/properties/property-image-manager";
import { PropertyUnitsList } from "@/components/properties/property-units-list";
import { PropertyDetailActions } from "@/components/properties/property-detail-actions";

export const metadata: Metadata = {
  title: "Détail propriété — Loca",
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const result = await getProperty(id);

  if (!result.success) {
    notFound();
  }

  const { property, units } = result.data!;
  const isArchived = property.status === "archived";

  const storagePaths = property.property_images.map((i) => i.storage_path);
  let signedUrls: Record<string, string> = {};

  if (storagePaths.length > 0) {
    const signed = await getPropertyImagesSignedUrls(storagePaths);
    if (signed.success && signed.data) {
      signedUrls = signed.data.urls;
    }
  }

  const nextSortOrder =
    property.property_images.length === 0
      ? 0
      : Math.max(...property.property_images.map((i) => i.sort_order)) + 1;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux propriétés
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                {property.name}
              </h1>
              {isArchived && (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  Archivée
                </span>
              )}
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {property.district ? `${property.district}, ` : ""}
              {property.city} — {property.address}
            </p>
          </div>

          <PropertyDetailActions
            propertyId={property.id}
            propertyName={property.name}
            isArchived={isArchived}
          />
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-heading text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Description
          </h2>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {property.description}
          </p>
        </div>
      )}

      {/* Coordonnées */}
      {(property.latitude !== null || property.longitude !== null) && (
        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Latitude</p>
            <p className="text-sm tabular-nums">
              {property.latitude?.toFixed(5) ?? "—"}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Longitude</p>
            <p className="text-sm tabular-nums">
              {property.longitude?.toFixed(5) ?? "—"}
            </p>
          </div>
        </div>
      )}

      {/* Images */}
      <div className="space-y-4">
        <h2 className="font-heading text-lg font-semibold">Images</h2>

        <PropertyImageGallery
          images={property.property_images}
          signedUrls={signedUrls}
        />

        {property.property_images.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Gérer les images ({property.property_images.length})
            </p>
            <PropertyImageManager
              images={property.property_images}
              signedUrls={signedUrls}
            />
          </div>
        )}

        {!isArchived && (
          <PropertyImageUpload
            propertyId={property.id}
            nextSortOrder={nextSortOrder}
          />
        )}

        {isArchived && (
          <p className="text-xs text-muted-foreground">
            Une propriété archivée ne peut plus recevoir de nouvelles images.
          </p>
        )}
      </div>

      {/* Logements (lecture seule) */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-lg font-semibold">Logements</h2>
          <span className="text-sm text-muted-foreground">
            {units.length} {units.length > 1 ? "logements" : "logement"}
          </span>
        </div>
        <PropertyUnitsList units={units} />
      </div>
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getProperty } from "@/actions/properties";
import { EditPropertyFormWrapper } from "@/components/properties/property-form-wrapper";

export const metadata: Metadata = {
  title: "Modifier la propriété — Loca",
};

export default async function EditPropertyPage({
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

  // RLS → null pour un ID étranger → 404 (pas d’énumération)
  if (!result.success) {
    notFound();
  }

  const { property } = result.data!;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href={`/dashboard/properties/${property.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour à la propriété
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">
          Modifier la propriété
        </h1>
        <p className="text-muted-foreground mt-1">
          Mettez à jour les informations de « {property.name} ».
        </p>
      </div>

      <EditPropertyFormWrapper
        propertyId={property.id}
        defaultValues={{
          name: property.name,
          description: property.description ?? "",
          address: property.address,
          city: property.city,
          district: property.district ?? "",
          latitude: property.latitude,
          longitude: property.longitude,
        }}
      />
    </div>
  );
}
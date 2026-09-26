import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getProperty } from "@/actions/properties";
import { CreateUnitFormWrapper } from "@/components/units/unit-form-wrapper";

export const metadata: Metadata = {
  title: "Nouveau logement — Loca",
};

export default async function NewUnitPage({
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

  const { id: propertyId } = await params;

  const result = await getProperty(propertyId);
  if (!result.success) {
    notFound();
  }

  const { property } = result.data!;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href={`/dashboard/properties/${propertyId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour à la propriété
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">
          Nouveau logement
        </h1>
        <p className="text-muted-foreground mt-1">
          Ajouter un logement à « {property.name} ».
        </p>
      </div>

      <CreateUnitFormWrapper propertyId={propertyId} />
    </div>
  );
}
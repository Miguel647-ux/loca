import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CreatePropertyFormWrapper } from "@/components/properties/property-form-wrapper";

export const metadata: Metadata = {
  title: "Nouvelle propriété — Loca",
};

export default async function NewPropertyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux propriétés
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">
          Nouvelle propriété
        </h1>
        <p className="text-muted-foreground mt-1">
          Renseignez les informations de la propriété à ajouter.
        </p>
      </div>

      <CreatePropertyFormWrapper />
    </div>
  );
}
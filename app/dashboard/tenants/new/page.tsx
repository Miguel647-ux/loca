import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CreateTenantFormWrapper } from "@/components/tenants/tenant-form-wrapper";

export const metadata: Metadata = { title: "Nouveau locataire — Loca" };

export default async function NewTenantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/tenants" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Retour aux locataires
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">Nouveau locataire</h1>
        <p className="text-muted-foreground mt-1">Enregistrez les coordonnées d’un nouveau locataire.</p>
      </div>
      <CreateTenantFormWrapper />
    </div>
  );
}
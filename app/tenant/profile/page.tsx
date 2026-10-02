import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getTenantDashboard } from "@/actions/dashboard";
import { EmptyState, ErrorState } from "@/components/states";
import { User } from "lucide-react";
import { TenantProfileForm } from "@/components/tenant-portal/tenant-profile-form";

export const metadata: Metadata = { title: "Mon profil — Loca" };

export default async function TenantProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const result = await getTenantDashboard();

  if (!result.success) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mon profil
        </h1>
        <ErrorState title="Impossible de charger votre profil" description={result.error} />
      </div>
    );
  }

  const dashboard = result.data!;

  if (!dashboard.linked) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mon profil
        </h1>
        <EmptyState
          icon={User}
          title="Compte non associé"
          description="Votre compte n'est pas encore associé à un dossier locataire."
        />
      </div>
    );
  }

  const { tenant } = dashboard;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Mon profil
        </h1>
        <p className="text-muted-foreground mt-1">
          Vos informations personnelles et de contact.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">Nom complet</p>
          <p className="text-sm font-medium mt-0.5">
            {tenant.first_name} {tenant.last_name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Le nom ne peut être modifié que par votre gestionnaire.
        </p>
      </div>

      <TenantProfileForm
        defaultValues={{
          phone: tenant.phone,
          email: tenant.email ?? "",
        }}
      />
    </div>
  );
}
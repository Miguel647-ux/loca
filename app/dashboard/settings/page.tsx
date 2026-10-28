import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mail, User as UserIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/actions/profile";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { SessionsCard } from "@/components/settings/sessions-card";
import { ErrorState } from "@/components/states";

export const metadata: Metadata = { title: "Paramètres — Loca" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const result = await getUserContext();

  if (!result.success) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Paramètres
        </h1>
        <ErrorState
          title="Impossible de charger vos paramètres"
          description={result.error}
        />
      </div>
    );
  }

  const ctx = result.data!;
  const profile = ctx.profile;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Paramètres
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez votre profil et la sécurité de votre compte.
        </p>
      </div>

      {/* Identité */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Identité
        </h2>
        <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted">
            <UserIcon className="size-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Compte {profile?.role ?? "—"}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Mail className="size-3" />
          Pour changer d’adresse email, contactez l’administrateur de la
          plateforme.
        </p>
      </section>

      {/* Profil */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Profil
        </h2>
        <ProfileForm
          defaultValues={{
            first_name: profile?.first_name ?? "",
            last_name: profile?.last_name ?? "",
            phone: profile?.phone ?? "",
          }}
        />
      </section>

      {/* Mot de passe */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Mot de passe
        </h2>
        <PasswordForm />
      </section>

      {/* Sessions */}
      <section className="space-y-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Sécurité
        </h2>
        <SessionsCard />
      </section>
    </div>
  );
}
import { getCurrentProfile } from "@/lib/permissions";

export default async function TenantHomePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Bonjour, {profile?.first_name ?? "utilisateur"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Bienvenue dans votre espace locataire.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Votre espace locataire sera disponible prochainement.
      </div>
    </div>
  );
}
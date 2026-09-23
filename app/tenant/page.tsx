import { Home } from "lucide-react";
import { getCurrentProfile } from "@/lib/permissions";
import { EmptyState } from "@/components/states";

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
      <EmptyState
        icon={Home}
        title="Bientôt disponible"
        description="Votre espace locataire sera développé dans une prochaine phase."
      />
    </div>
  );
}
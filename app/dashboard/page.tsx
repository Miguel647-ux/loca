import { LayoutDashboard } from "lucide-react";
import { getCurrentProfile } from "@/lib/permissions";
import { EmptyState } from "@/components/states";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Bonjour, {profile?.first_name ?? "utilisateur"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Voici un aperçu de votre activité locative.
        </p>
      </div>
      <EmptyState
        icon={LayoutDashboard}
        title="Bientôt disponible"
        description="Le tableau de bord complet sera développé dans une prochaine phase."
      />
    </div>
  );
}
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/states";

export function PlaceholderPage({
  title,
  icon,
}: {
  title: string;
  icon: LucideIcon;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {title}
        </h1>
      </div>
      <EmptyState
        icon={icon}
        title="Bientôt disponible"
        description="Cette section sera développée dans une prochaine phase du projet."
      />
    </div>
  );
}
import Link from "next/link";
import { Building2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/states";

export default function PropertyNotFound() {
  return (
    <div className="space-y-6 max-w-2xl">
      <EmptyState
        icon={Building2}
        title="Propriété introuvable"
        description="Cette propriété n'existe pas ou ne vous appartient pas."
        action={
          <Link
            href="/dashboard/properties"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Retour aux propriétés
          </Link>
        }
      />
    </div>
  );
}
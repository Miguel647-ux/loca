import Link from "next/link";
import { User } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/states";

export default function TenantNotFound() {
  return (
    <div className="space-y-6 max-w-2xl">
      <EmptyState
        icon={User}
        title="Locataire introuvable"
        description="Ce locataire n'existe pas ou ne vous appartient pas."
        action={
          <Link href="/dashboard/tenants" className={cn(buttonVariants({ variant: "outline" }))}>
            Retour aux locataires
          </Link>
        }
      />
    </div>
  );
}
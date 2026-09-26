import Link from "next/link";
import { FileText } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/states";

export default function LeaseNotFound() {
  return (
    <div className="space-y-6 max-w-2xl">
      <EmptyState
        icon={FileText}
        title="Bail introuvable"
        description="Ce bail n'existe pas ou ne vous appartient pas."
        action={
          <Link href="/dashboard/leases" className={cn(buttonVariants({ variant: "outline" }))}>
            Retour aux baux
          </Link>
        }
      />
    </div>
  );
}
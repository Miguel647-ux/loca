import Link from "next/link";
import { Receipt } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/states";

export default function RentDueNotFound() {
  return (
    <div className="space-y-6 max-w-2xl">
      <EmptyState
        icon={Receipt}
        title="Échéance introuvable"
        description="Cette échéance n'existe pas ou ne vous appartient pas."
        action={
          <Link
            href="/dashboard/payments"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Retour aux paiements
          </Link>
        }
      />
    </div>
  );
}
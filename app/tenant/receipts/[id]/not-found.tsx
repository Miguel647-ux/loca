import Link from "next/link";
import { FileText } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/states";

export default function TenantReceiptNotFound() {
  return (
    <div className="space-y-6 max-w-2xl">
      <EmptyState
        icon={FileText}
        title="Reçu introuvable"
        description="Ce reçu n'existe pas ou ne vous appartient pas."
        action={
          <Link
            href="/tenant/receipts"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Retour aux reçus
          </Link>
        }
      />
    </div>
  );
}
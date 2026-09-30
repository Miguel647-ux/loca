import Link from "next/link";
import {
  Building2,
  CreditCard,
  DoorOpen,
  FileText,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Action = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const ACTIONS: Action[] = [
  { label: "Nouvelle propriété", href: "/dashboard/properties/new", icon: Building2 },
  { label: "Ajouter un locataire", href: "/dashboard/tenants/new", icon: Users },
  { label: "Créer un bail", href: "/dashboard/leases/new", icon: FileText },
  { label: "Nouvelle échéance", href: "/dashboard/payments/new", icon: CreditCard },
  { label: "Voir les paiements", href: "/dashboard/payments", icon: Wallet },
  { label: "Voir les reçus", href: "/dashboard/receipts", icon: Receipt },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5",
              "text-sm transition-colors hover:border-foreground/20 hover:bg-muted/30"
            )}
          >
            <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground group-hover:bg-[var(--brand)]/10 group-hover:text-[var(--brand)] transition-colors">
              <Icon className="size-3.5" />
            </div>
            <span className="truncate font-medium">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
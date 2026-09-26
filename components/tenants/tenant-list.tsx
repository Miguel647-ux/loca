import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/states";
import type { Tenant } from "@/types/database";

export function TenantList({
  items,
  hasFilters,
}: {
  items: Tenant[];
  hasFilters: boolean;
}) {
  if (items.length === 0) {
    if (hasFilters) {
      return (
        <EmptyState
          icon={User}
          title="Aucun résultat"
          description="Aucun locataire ne correspond à votre recherche."
        />
      );
    }
    return (
      <EmptyState
        icon={User}
        title="Aucun locataire"
        description="Vous n'avez encore enregistré aucun locataire."
        action={
          <Link href="/dashboard/tenants/new" className={cn(buttonVariants())}>
            Ajouter un locataire
          </Link>
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Nom</th>
            <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Téléphone</th>
            <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Email</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((tenant) => (
            <tr key={tenant.id} className="border-t transition-colors hover:bg-muted/20">
              <td className="px-4 py-3">
                <Link href={`/dashboard/tenants/${tenant.id}`} className="font-medium hover:underline">
                  {tenant.first_name} {tenant.last_name}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="size-3.5" />
                  {tenant.phone}
                </span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {tenant.email ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="size-3.5" />
                    {tenant.email}
                  </span>
                ) : (
                  <span className="text-muted-foreground/60">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/dashboard/tenants/${tenant.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Voir
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
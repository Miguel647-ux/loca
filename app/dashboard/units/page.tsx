import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, DoorOpen, Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAllUnits } from "@/actions/units";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState, ErrorState } from "@/components/states";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Logements — Loca" };

type UnitRow = {
  id: string;
  unit_number: string;
  property_id: string;
  status: string;
  property: { id: string; name: string } | null;
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  available: "outline",
  occupied: "default",
  maintenance: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  available: "Disponible",
  occupied: "Occupé",
  maintenance: "Maintenance",
};

export default async function UnitsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const result = await getAllUnits();

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Logements</h1>
        <ErrorState title="Impossible de charger les logements" description={result.error} />
      </div>
    );
  }

  const units = (result.data ?? []) as UnitRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Tous les logements
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue centralisée de votre parc immobilier.
          </p>
        </div>
        <Link href="/dashboard/properties" className={cn(buttonVariants())}>
          <Building2 className="size-4" />
          Voir les propriétés
        </Link>
      </div>

      {units.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title="Aucun logement"
          description="Vous n'avez pas encore ajouté de logement à vos propriétés."
          action={
            <Link href="/dashboard/properties" className={cn(buttonVariants())}>
              Aller aux propriétés
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Logement</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Propriété</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{u.unit_number}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {u.property?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANTS[u.status] ?? "outline"}>
                      {STATUS_LABELS[u.status] ?? u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/properties/${u.property_id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Voir la propriété
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Mail, MapPin, Phone, Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/actions/tenants";
import { DeleteTenantDialog } from "@/components/tenants/delete-tenant-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LeaseStatusBadge } from "@/components/leases/lease-status-badge";
import type { LeaseStatus } from "@/lib/validations/lease";

export const metadata: Metadata = { title: "Détail locataire — Loca" };

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const result = await getTenant(id);
  if (!result.success) notFound();

  const { tenant, leases } = result.data!;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-4">
        <Link href="/dashboard/tenants" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Retour aux locataires
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight">
              {tenant.first_name} {tenant.last_name}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Phone className="size-3.5" />{tenant.phone}</span>
              {tenant.email && <span className="inline-flex items-center gap-1.5"><Mail className="size-3.5" />{tenant.email}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/tenants/${tenant.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <Pencil className="size-4" />
              Modifier
            </Link>
            <DeleteTenantDialog
              tenantId={tenant.id}
              tenantName={`${tenant.first_name} ${tenant.last_name}`}
              redirectAfter
            />
          </div>
        </div>
      </div>

      {(tenant.id_number || tenant.emergency_contact_name || tenant.emergency_contact_phone || tenant.notes) && (
        <div className="rounded-lg border bg-card p-5 space-y-4">
          {tenant.id_number && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Numéro d’identité</p>
              <p className="text-sm">{tenant.id_number}</p>
            </div>
          )}
          {(tenant.emergency_contact_name || tenant.emergency_contact_phone) && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Contact d’urgence</p>
              <p className="text-sm">
                {tenant.emergency_contact_name ?? "—"}
                {tenant.emergency_contact_phone && ` · ${tenant.emergency_contact_phone}`}
              </p>
            </div>
          )}
          {tenant.notes && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{tenant.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Baux</h2>
        {leases.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Ce locataire n’a encore aucun bail enregistré.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Logement</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Période</th>
                  <th className="px-4 py-3 text-left font-medium">Statut</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-muted/20">
                    <td className="px-4 py-3">
                      {l.unit?.unit_number ?? "—"}
                      {l.property && <span className="text-muted-foreground text-xs"> · {l.property.name}</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground text-xs">
                      {new Date(l.start_date).toLocaleDateString("fr-FR")} → {l.end_date ? new Date(l.end_date).toLocaleDateString("fr-FR") : "en cours"}
                    </td>
                    <td className="px-4 py-3"><LeaseStatusBadge status={l.status as LeaseStatus} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/leases/${l.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
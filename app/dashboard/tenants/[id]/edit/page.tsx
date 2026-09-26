import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getTenant } from "@/actions/tenants";
import { EditTenantFormWrapper } from "@/components/tenants/tenant-form-wrapper";

export const metadata: Metadata = { title: "Modifier le locataire — Loca" };

export default async function EditTenantPage({
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

  const { tenant } = result.data!;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/tenants/${tenant.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Retour au locataire
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">Modifier le locataire</h1>
        <p className="text-muted-foreground mt-1">
          {tenant.first_name} {tenant.last_name}
        </p>
      </div>

      <EditTenantFormWrapper
        tenantId={tenant.id}
        defaultValues={{
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          phone: tenant.phone,
          email: tenant.email ?? "",
          id_number: tenant.id_number ?? "",
          emergency_contact_name: tenant.emergency_contact_name ?? "",
          emergency_contact_phone: tenant.emergency_contact_phone ?? "",
          notes: tenant.notes ?? "",
        }}
      />
    </div>
  );
}
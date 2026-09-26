import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getLease } from "@/actions/leases";
import { EditLeaseFormWrapper } from "@/components/leases/lease-form-wrapper";

export const metadata: Metadata = { title: "Modifier le bail — Loca" };

export default async function EditLeasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const result = await getLease(id);
  if (!result.success) notFound();

  const lease = result.data!;

  if (lease.status === "terminated" || lease.status === "expired") {
    redirect(`/dashboard/leases/${lease.id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/leases/${lease.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Retour au bail
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">Modifier le bail</h1>
        <p className="text-muted-foreground mt-1">
          Logement {lease.unit?.unit_number ?? "—"}
          {lease.tenant && ` · ${lease.tenant.first_name} ${lease.tenant.last_name}`}
        </p>
      </div>

      <EditLeaseFormWrapper
        leaseId={lease.id}
        defaultValues={{
          start_date: lease.start_date,
          end_date: lease.end_date,
          monthly_rent: Number(lease.monthly_rent),
          deposit_amount: Number(lease.deposit_amount),
          payment_due_day: lease.payment_due_day,
          status: lease.status as "pending" | "active" | "expired" | "terminated",
          notes: lease.notes ?? "",
        }}
      />
    </div>
  );
}
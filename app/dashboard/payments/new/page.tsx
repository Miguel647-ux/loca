import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  CreateRentDueForm,
  type LeaseOption,
} from "@/components/rent-dues/create-rent-due-form";

export const metadata: Metadata = { title: "Nouvelle échéance — Loca" };

type LeaseRow = {
  id: string;
  monthly_rent: number;
  tenant: { first_name: string; last_name: string } | null;
  unit: { unit_number: string; property_id: string } | null;
};

export default async function NewRentDuePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const raw = await searchParams;
  const defaultLeaseId =
    typeof raw.lease_id === "string" ? raw.lease_id : undefined;

  // Récupère les baux actifs avec tenant + unit
  const { data: leasesRaw } = await supabase
    .from("leases")
    .select(
      "id, monthly_rent, status, tenant:tenants(first_name, last_name), unit:units(unit_number, property_id)"
    )
    .eq("status", "active");

  const leases: LeaseOption[] = ((leasesRaw ?? []) as unknown as LeaseRow[]).map(
    (l) => ({
      id: l.id,
      label: `${l.tenant?.first_name ?? "?"} ${l.tenant?.last_name ?? ""} · ${l.unit?.unit_number ?? "?"} — ${Number(l.monthly_rent).toLocaleString("fr-FR")} FCFA`,
      monthly_rent: Number(l.monthly_rent),
    })
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux paiements
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">
          Nouvelle échéance
        </h1>
        <p className="text-muted-foreground mt-1">
          Créez une obligation de loyer pour un bail actif.
        </p>
      </div>

      <CreateRentDueForm leases={leases} defaultLeaseId={defaultLeaseId} />
    </div>
  );
}
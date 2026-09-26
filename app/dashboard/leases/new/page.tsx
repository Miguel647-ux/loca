import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  LeaseCreateForm,
  type TenantOption,
  type UnitOption,
} from "@/components/leases/lease-create-form";

export const metadata: Metadata = { title: "Nouveau bail — Loca" };

type MyUnitRow = {
  id: string;
  unit_number: string;
  property_id: string;
  status: string;
  property: { id: string; name: string } | null;
};

export default async function NewLeasePage({
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
  const defaultUnitId =
    typeof raw.unit_id === "string" ? raw.unit_id : undefined;

  // Locataires (RLS tenants : pas de récursion)
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, first_name, last_name, phone")
    .order("first_name", { ascending: true });

  // Unités via RPC (contourne la récursion units ↔ leases)
  const { data: unitsData, error: unitsError } = await supabase.rpc(
    "list_my_units"
  );

  if (unitsError) {
    console.error("[NewLeasePage] units RPC error:", unitsError);
  }

  const rows = (unitsData ?? []) as MyUnitRow[];

  // On ne propose que les unités SANS bail actif
  // (les unités occupées ne sont pas concernées par une nouvelle création)
  const availableUnits = rows.filter((u) => u.status !== "occupied");

  const units: UnitOption[] = availableUnits.map((u) => ({
    id: u.id,
    unit_number: u.unit_number,
    property_id: u.property_id,
    property_name: u.property?.name ?? "—",
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/leases"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux baux
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">
          Nouveau bail
        </h1>
        <p className="text-muted-foreground mt-1">
          Associez un locataire à un logement.
        </p>
      </div>

      <LeaseCreateForm
        tenants={(tenants ?? []) as TenantOption[]}
        units={units}
        defaultUnitId={defaultUnitId}
      />
    </div>
  );
}
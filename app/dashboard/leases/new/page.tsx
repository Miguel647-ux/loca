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

type UnitRow = {
  id: string;
  unit_number: string;
  property_id: string;
  status: string;
  property: { name: string } | null;
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
  const defaultUnitId = typeof raw.unit_id === "string" ? raw.unit_id : undefined;

  // 1. Récupérer les locataires
  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, first_name, last_name, phone")
    .order("first_name", { ascending: true });

  // 2. Récupérer TOUS les logements via la RPC (contourne la RLS)
  const { data: unitsData } = await supabase.rpc("list_my_units");
  const rows = (unitsData ?? []) as UnitRow[];

  // 3. On prépare la liste pour le formulaire
  // On garde TOUS les logements, on ne filtre plus les "occupés" ici.
  const units: UnitOption[] = rows.map((u) => ({
    id: u.id,
    unit_number: u.unit_number,
    property_id: u.property_id,
    property_name: u.property?.name ?? "—",
    status: u.status, // On ajoute le statut pour le formulaire
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
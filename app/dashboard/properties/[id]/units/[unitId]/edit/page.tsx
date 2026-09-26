import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getProperty } from "@/actions/properties";
import { getUnit } from "@/actions/units";
import { getActiveLeaseForUnit } from "@/actions/leases";
import { EditUnitFormWrapper } from "@/components/units/unit-form-wrapper";
import { ActiveLeasePanel } from "@/components/leases/active-lease-panel";

export const metadata: Metadata = {
  title: "Modifier le logement — Loca",
};

export default async function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string; unitId: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id: propertyId, unitId } = await params;

  const propResult = await getProperty(propertyId);
  if (!propResult.success) notFound();

  const unitResult = await getUnit(unitId);
  if (!unitResult.success) notFound();

  const unit = unitResult.data!;
  if (unit.property_id !== propertyId) notFound();

  const { property } = propResult.data!;

  // Bail actif (peut être null)
  const leaseResult = await getActiveLeaseForUnit(unitId);
  const activeLease = leaseResult.success ? (leaseResult.data ?? null) : null;

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <Link href={`/dashboard/properties/${propertyId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Retour à la propriété
        </Link>
        <h1 className="font-heading text-3xl font-bold tracking-tight mt-2">
          Modifier le logement « {unit.unit_number} »
        </h1>
        <p className="text-muted-foreground mt-1">Propriété : {property.name}</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Bail actif</h2>
        <ActiveLeasePanel
          unitId={unit.id}
          propertyId={propertyId}
          activeLease={activeLease}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Informations du logement</h2>
        <EditUnitFormWrapper
          unitId={unit.id}
          propertyId={propertyId}
          defaultValues={{
            unit_number: unit.unit_number,
            unit_type: unit.unit_type,
            monthly_rent: Number(unit.monthly_rent),
            status: unit.status,
            description: unit.description ?? "",
            floor: unit.floor,
            area_m2: unit.area_m2,
          }}
        />
      </section>
    </div>
  );
}
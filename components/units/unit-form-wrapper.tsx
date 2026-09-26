"use client";

import { createUnit, updateUnit } from "@/actions/units";
import { UnitForm, type UnitFormAction, type UnitFormValues } from "./unit-form";

export function CreateUnitFormWrapper({
  propertyId,
}: {
  propertyId: string;
}) {
  const action: UnitFormAction = async (values: UnitFormValues) => {
    return createUnit({ ...values, property_id: propertyId });
  };

  return (
    <UnitForm
      action={action}
      submitLabel="Créer le logement"
      successMessage="Logement créé."
      redirectTo={() => `/dashboard/properties/${propertyId}`}
    />
  );
}

export function EditUnitFormWrapper({
  unitId,
  propertyId,
  defaultValues,
}: {
  unitId: string;
  propertyId: string;
  defaultValues: Partial<UnitFormValues>;
}) {
  const action: UnitFormAction = async (values: UnitFormValues) => {
    return updateUnit(unitId, values);
  };

  return (
    <UnitForm
      action={action}
      defaultValues={defaultValues}
      submitLabel="Enregistrer les modifications"
      successMessage="Logement mis à jour."
      redirectTo={() => `/dashboard/properties/${propertyId}`}
    />
  );
}
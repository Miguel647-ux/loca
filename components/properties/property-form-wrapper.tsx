"use client";

import { createProperty, updateProperty } from "@/actions/properties";
import {
  PropertyForm,
  type PropertyFormAction,
} from "./property-form";
import type { PropertyInput } from "@/lib/validations/property";

const createAction: PropertyFormAction = async (values: PropertyInput) => {
  return createProperty(values);
};

export function CreatePropertyFormWrapper() {
  return (
    <PropertyForm
      action={createAction}
      submitLabel="Créer la propriété"
      successMessage="Propriété créée."
      redirectTo={(id) => `/dashboard/properties/${id}`}
    />
  );
}

export function EditPropertyFormWrapper({
  propertyId,
  defaultValues,
}: {
  propertyId: string;
  defaultValues: Partial<PropertyInput>;
}) {
  const updateAction: PropertyFormAction = async (values: PropertyInput) => {
    return updateProperty(propertyId, values);
  };

  return (
    <PropertyForm
      action={updateAction}
      defaultValues={defaultValues}
      submitLabel="Enregistrer les modifications"
      successMessage="Propriété mise à jour."
      redirectTo={(id) => `/dashboard/properties/${id}`}
    />
  );
}
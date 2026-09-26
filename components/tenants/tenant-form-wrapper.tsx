"use client";

import { createTenant, updateTenant } from "@/actions/tenants";
import { TenantForm, type TenantFormAction } from "./tenant-form";
import type { TenantInput } from "@/lib/validations/tenant";

const createAction: TenantFormAction = async (values: TenantInput) => {
  return createTenant(values);
};

export function CreateTenantFormWrapper() {
  return (
    <TenantForm
      action={createAction}
      submitLabel="Créer le locataire"
      successMessage="Locataire créé."
      redirectTo={(id) => `/dashboard/tenants/${id}`}
    />
  );
}

export function EditTenantFormWrapper({
  tenantId,
  defaultValues,
}: {
  tenantId: string;
  defaultValues: Partial<TenantInput>;
}) {
  const updateAction: TenantFormAction = async (values: TenantInput) => {
    return updateTenant(tenantId, values);
  };

  return (
    <TenantForm
      action={updateAction}
      defaultValues={defaultValues}
      submitLabel="Enregistrer les modifications"
      successMessage="Locataire mis à jour."
      redirectTo={(id) => `/dashboard/tenants/${id}`}
    />
  );
}
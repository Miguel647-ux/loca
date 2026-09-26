"use client";

import { createLease, updateLease } from "@/actions/leases";
import { LeaseForm, type LeaseFormAction, type LeaseFormValues } from "./lease-form";

export function EditLeaseFormWrapper({
  leaseId,
  defaultValues,
}: {
  leaseId: string;
  defaultValues: Partial<LeaseFormValues>;
}) {
  const action: LeaseFormAction = async (values: LeaseFormValues) => {
    return updateLease(leaseId, values);
  };

  return (
    <LeaseForm
      action={action}
      defaultValues={defaultValues}
      submitLabel="Enregistrer les modifications"
      successMessage="Bail mis à jour."
      redirectTo={(id) => `/dashboard/leases/${id}`}
    />
  );
}
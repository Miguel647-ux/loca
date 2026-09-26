"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createLeaseSchema,
  LEASE_STATUSES,
  LEASE_STATUS_LABELS,
  type CreateLeaseInput,
  type LeaseStatus,
} from "@/lib/validations/lease";
import { createLease } from "@/actions/leases";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type TenantOption = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
};

export type UnitOption = {
  id: string;
  unit_number: string;
  property_id: string;
  property_name: string;
};

export function LeaseCreateForm({
  tenants,
  units,
  defaultUnitId,
}: {
  tenants: TenantOption[];
  units: UnitOption[];
  defaultUnitId?: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateLeaseInput>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: {
      unit_id: defaultUnitId ?? "",
      tenant_id: "",
      start_date: new Date().toISOString().slice(0, 10),
      end_date: null,
      monthly_rent: 0,
      deposit_amount: 0,
      payment_due_day: 5,
      status: "pending",
      notes: "",
    },
  });

  async function onSubmit(values: CreateLeaseInput) {
    setIsPending(true);
    const result = await createLease(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(key as keyof CreateLeaseInput, {
              message: messages[0],
            });
          }
        }
      }
      return;
    }

    toast.success("Bail créé.");
    router.push(`/dashboard/leases/${result.data?.id ?? ""}`);
    router.refresh();
  }

  const hasTenants = tenants.length > 0;
  const hasUnits = units.length > 0;

  if (!hasTenants || !hasUnits) {
    return (
      <div className="rounded-lg border bg-card p-6 space-y-3 max-w-2xl">
        <p className="font-medium">
          {!hasTenants && !hasUnits && "Vous devez d’abord créer un locataire et un logement."}
          {!hasTenants && hasUnits && "Vous devez d’abord créer un locataire."}
          {hasTenants && !hasUnits && "Vous devez d’abord créer un logement."}
        </p>
        <div className="flex gap-2">
          {!hasTenants && (
            <Button onClick={() => router.push("/dashboard/tenants/new")}>
              Créer un locataire
            </Button>
          )}
          {!hasUnits && (
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/properties")}
            >
              Créer un logement
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tenant_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locataire *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue>
                        {(() => {
                          const t = tenants.find((x) => x.id === field.value);
                          return t
                            ? `${t.first_name} ${t.last_name}`
                            : "Sélectionner un locataire";
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tenants.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.first_name} {t.last_name} — {t.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logement *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue>
                        {(() => {
                          const u = units.find((x) => x.id === field.value);
                          return u
                            ? `${u.unit_number} — ${u.property_name}`
                            : "Sélectionner un logement";
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.unit_number} — {u.property_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Un seul bail actif par logement.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de début *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Optionnel.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="monthly_rent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loyer mensuel (FCFA) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deposit_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dépôt de garantie *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_due_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jour d’échéance *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    step="1"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Statut *</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => field.onChange(v as LeaseStatus)}
              >
                <FormControl>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue>
                      {LEASE_STATUS_LABELS[field.value as LeaseStatus] ??
                        field.value}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LEASE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LEASE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                « Actif » marque automatiquement le logement comme occupé.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  rows={4}
                  maxLength={2000}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Création…" : "Créer le bail"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
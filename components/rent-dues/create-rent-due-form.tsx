"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createRentDueSchema,
  computeMonthlyPeriod,
  type CreateRentDueInput,
} from "@/lib/validations/rent-due";
import { createRentDue } from "@/actions/rent-dues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type LeaseOption = {
  id: string;
  label: string;
  monthly_rent: number;
};

export function CreateRentDueForm({
  leases,
  defaultLeaseId,
}: {
  leases: LeaseOption[];
  defaultLeaseId?: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const initialLease = leases.find((l) => l.id === defaultLeaseId);
  const period = computeMonthlyPeriod(new Date());

  const form = useForm<CreateRentDueInput>({
    resolver: zodResolver(createRentDueSchema),
    defaultValues: {
      lease_id: defaultLeaseId ?? "",
      period_start: period.start,
      period_end: period.end,
      due_date: period.dueDate,
      amount_due: initialLease?.monthly_rent ?? 0,
    },
  });

  function handleLeaseChange(leaseId: string) {
    const lease = leases.find((l) => l.id === leaseId);
    if (lease) {
      form.setValue("amount_due", lease.monthly_rent);
    }
    form.setValue("lease_id", leaseId);
  }

  async function onSubmit(values: CreateRentDueInput) {
    setIsPending(true);
    const result = await createRentDue(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(key as keyof CreateRentDueInput, {
              message: messages[0],
            });
          }
        }
      }
      return;
    }

    toast.success("Échéance créée.");
    router.push(`/dashboard/payments/${result.data?.id ?? ""}`);
    router.refresh();
  }

  if (leases.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6 space-y-3 max-w-2xl">
        <p className="font-medium">
          Vous devez d’abord créer un bail actif.
        </p>
        <Button onClick={() => router.push("/dashboard/leases/new")}>
          Créer un bail
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl"
      >
        <FormField
          control={form.control}
          name="lease_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bail *</FormLabel>
              <FormControl>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={field.value}
                  onChange={(e) => handleLeaseChange(e.target.value)}
                >
                  <option value="">Sélectionner un bail…</option>
                  {leases.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Seuls les baux actifs sont proposés.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="period_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Début de période *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="period_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fin de période *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d’échéance *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amount_due"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant dû (FCFA) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
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
              <FormDescription>
                Pré-rempli avec le loyer mensuel du bail.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Création…" : "Créer l’échéance"}
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
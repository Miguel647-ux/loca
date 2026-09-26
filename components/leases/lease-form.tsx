"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  updateLeaseSchema,
  LEASE_STATUSES,
  LEASE_STATUS_LABELS,
  type LeaseStatus,
} from "@/lib/validations/lease";
import type { ActionResult } from "@/lib/action-result";
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

export type LeaseFormValues = z.input<typeof updateLeaseSchema>;

export type LeaseFormAction = (
  values: LeaseFormValues
) => Promise<ActionResult<{ id: string }>>;

export function LeaseForm({
  action,
  defaultValues,
  submitLabel = "Enregistrer",
  successMessage = "Bail enregistré.",
  redirectTo,
}: {
  action: LeaseFormAction;
  defaultValues?: Partial<LeaseFormValues>;
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: (id: string) => string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LeaseFormValues>({
    resolver: zodResolver(updateLeaseSchema),
    defaultValues: {
      start_date: defaultValues?.start_date ?? new Date().toISOString().slice(0, 10),
      end_date: defaultValues?.end_date ?? null,
      monthly_rent: defaultValues?.monthly_rent ?? 0,
      deposit_amount: defaultValues?.deposit_amount ?? 0,
      payment_due_day: defaultValues?.payment_due_day ?? 5,
      status: defaultValues?.status ?? "pending",
      notes: defaultValues?.notes ?? "",
    },
  });

  async function onSubmit(values: LeaseFormValues) {
    setIsPending(true);
    const result = await action(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(key as keyof LeaseFormValues, { message: messages[0] });
          }
        }
      }
      return;
    }

    toast.success(successMessage);
    const id = result.data?.id;
    if (id && redirectTo) router.push(redirectTo(id));
    else router.push("/dashboard/leases");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
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
                <FormDescription>Optionnel. Postérieure ou égale au début.</FormDescription>
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
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
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
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
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
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Entre 1 et 31.</FormDescription>
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
              <Select value={field.value} onValueChange={(v) => field.onChange(v as LeaseStatus)}>
                <FormControl>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue>
                      {LEASE_STATUS_LABELS[field.value as LeaseStatus] ?? field.value}
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
                « Actif » marque le logement comme occupé.
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
                <Textarea rows={4} maxLength={2000} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Optionnel. 2000 caractères maximum.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : submitLabel}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </form>
    </Form>
  );
}
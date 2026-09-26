"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  updateUnitSchema,
  UNIT_STATUSES,
  UNIT_STATUS_LABELS,
  UNIT_TYPES,
  UNIT_TYPE_LABELS,
  type UnitStatus,
  type UnitType,
} from "@/lib/validations/unit";
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

export type UnitFormValues = {
  unit_number: string;
  unit_type: UnitType;
  monthly_rent: number;
  status: UnitStatus;
  description?: string;
  floor: number | null;
  area_m2: number | null;
};

export type UnitFormAction = (
  values: UnitFormValues
) => Promise<ActionResult<{ id: string }>>;

export function UnitForm({
  action,
  defaultValues,
  submitLabel = "Enregistrer",
  successMessage = "Logement enregistré.",
  redirectTo,
}: {
  action: UnitFormAction;
  defaultValues?: Partial<UnitFormValues>;
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: (id: string) => string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(updateUnitSchema),
    defaultValues: {
      unit_number: defaultValues?.unit_number ?? "",
      unit_type: defaultValues?.unit_type ?? "apartment",
      monthly_rent: defaultValues?.monthly_rent ?? 0,
      status: defaultValues?.status ?? "available",
      description: defaultValues?.description ?? "",
      floor: defaultValues?.floor ?? null,
      area_m2: defaultValues?.area_m2 ?? null,
    },
  });

  async function onSubmit(values: UnitFormValues) {
    setIsPending(true);
    const result = await action(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(key as keyof UnitFormValues, {
              message: messages[0],
            });
          }
        }
      }
      return;
    }

    toast.success(successMessage);
    const id = result.data?.id;
    if (id && redirectTo) {
      router.push(redirectTo(id));
    } else {
      router.push("/dashboard/units");
    }
    router.refresh();
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
            name="unit_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro *</FormLabel>
                <FormControl>
                  <Input placeholder="A12" maxLength={50} {...field} />
                </FormControl>
                <FormDescription>
                  Doit être unique dans cette propriété.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as UnitType)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-9">
  <SelectValue>
    {UNIT_TYPE_LABELS[field.value as UnitType] ?? field.value}
  </SelectValue>
</SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNIT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {UNIT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? 0 : Number(v));
                    }}
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => field.onChange(v as UnitStatus)}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-9">
  <SelectValue>
    {UNIT_STATUS_LABELS[field.value as UnitStatus] ?? field.value}
  </SelectValue>
</SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNIT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {UNIT_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Étage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? null : Number(v));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Optionnel. Entier ≥ 0.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area_m2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="45"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v === "" ? null : Number(v));
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>Optionnel. &gt; 0.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Quelques mots sur ce logement…"
                  rows={4}
                  maxLength={2000}
                  {...field}
                  value={field.value ?? ""}
                />
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
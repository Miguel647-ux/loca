"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  propertySchema,
  type PropertyInput,
} from "@/lib/validations/property";
import type { ActionResult } from "@/lib/action-result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export type PropertyFormAction = (
  values: PropertyInput
) => Promise<ActionResult<{ id: string }>>;

export function PropertyForm({
  action,
  defaultValues,
  submitLabel = "Enregistrer",
  successMessage = "Propriété enregistrée.",
  redirectTo,
}: {
  action: PropertyFormAction;
  defaultValues?: Partial<PropertyInput>;
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: (id: string) => string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      address: defaultValues?.address ?? "",
      city: defaultValues?.city ?? "",
      district: defaultValues?.district ?? "",
      latitude: defaultValues?.latitude ?? null,
      longitude: defaultValues?.longitude ?? null,
    },
  });

  async function onSubmit(values: PropertyInput) {
    setIsPending(true);
    const result = await action(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(key as keyof PropertyInput, {
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
      router.push("/dashboard/properties");
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-2xl"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la propriété *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Résidence Les Palmiers"
                  maxLength={150}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Quelques mots sur la propriété…"
                  rows={4}
                  maxLength={5000}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>Optionnel. 5000 caractères maximum.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse *</FormLabel>
              <FormControl>
                <Input
                  placeholder="12 rue des Cocotiers"
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville *</FormLabel>
                <FormControl>
                  <Input placeholder="Cotonou" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quartier</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Fidjrossè"
                    maxLength={100}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
  control={form.control}
  name="latitude"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Latitude</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="any"
          placeholder="6.3654"
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
      <FormDescription>Entre -90 et 90.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

<FormField
  control={form.control}
  name="longitude"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Longitude</FormLabel>
      <FormControl>
        <Input
          type="number"
          step="any"
          placeholder="2.4183"
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
      <FormDescription>Entre -180 et 180.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
        </div>

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
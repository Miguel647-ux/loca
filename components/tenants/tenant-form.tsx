"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { tenantSchema, type TenantInput } from "@/lib/validations/tenant";
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

export type TenantFormAction = (
  values: TenantInput
) => Promise<ActionResult<{ id: string }>>;

export function TenantForm({
  action,
  defaultValues,
  submitLabel = "Enregistrer",
  successMessage = "Locataire enregistré.",
  redirectTo,
}: {
  action: TenantFormAction;
  defaultValues?: Partial<TenantInput>;
  submitLabel?: string;
  successMessage?: string;
  redirectTo?: (id: string) => string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      first_name: defaultValues?.first_name ?? "",
      last_name: defaultValues?.last_name ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      id_number: defaultValues?.id_number ?? "",
      emergency_contact_name: defaultValues?.emergency_contact_name ?? "",
      emergency_contact_phone: defaultValues?.emergency_contact_phone ?? "",
      notes: defaultValues?.notes ?? "",
    },
  });

  async function onSubmit(values: TenantInput) {
    setIsPending(true);
    const result = await action(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(key as keyof TenantInput, { message: messages[0] });
          }
        }
      }
      return;
    }

    toast.success(successMessage);
    const id = result.data?.id;
    if (id && redirectTo) router.push(redirectTo(id));
    else router.push("/dashboard/tenants");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom *</FormLabel>
                <FormControl>
                  <Input autoComplete="given-name" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input autoComplete="family-name" maxLength={100} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone *</FormLabel>
                <FormControl>
                  <Input type="tel" autoComplete="tel" placeholder="+229 …" maxLength={30} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" placeholder="jean@exemple.com" {...field} />
                </FormControl>
                <FormDescription>Optionnel.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="id_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Numéro d’identité</FormLabel>
              <FormControl>
                <Input placeholder="CNI, passeport…" maxLength={50} {...field} />
              </FormControl>
              <FormDescription>Optionnel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="emergency_contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact d’urgence — nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du contact" maxLength={150} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="emergency_contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact d’urgence — téléphone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+229 …" maxLength={30} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={4} maxLength={2000} placeholder="Informations complémentaires…" {...field} value={field.value ?? ""} />
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
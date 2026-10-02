"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { updateTenantProfile } from "@/actions/tenant-portal";
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

const profileSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(3, "Le téléphone doit contenir au moins 3 caractères.")
    .max(30, "Le téléphone ne peut pas dépasser 30 caractères."),
  email: z
    .string()
    .trim()
    .max(200, "L'email est trop long.")
    .email("Adresse email invalide.")
    .optional()
    .or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function TenantProfileForm({
  defaultValues,
}: {
  defaultValues: ProfileFormValues;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileFormValues) {
    setIsPending(true);
    const result = await updateTenantProfile(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            form.setError(key as keyof ProfileFormValues, {
              message: messages[0],
            });
          }
        }
      }
      return;
    }

    toast.success("Profil mis à jour.");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="rounded-lg border bg-card p-5 space-y-5"
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Téléphone *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="+229 …" maxLength={30} {...field} />
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
                <Input
                  type="email"
                  placeholder="jean@exemple.com"
                  maxLength={200}
                  {...field}
                />
              </FormControl>
              <FormDescription>Optionnel.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
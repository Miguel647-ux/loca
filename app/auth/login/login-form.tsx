"use client";

import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { signIn } from "@/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { getSafeRedirect } from "@/lib/utils"; // Import de la sécurité
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setIsPending(true);
    const result = await signIn(values);

    if (!result.success) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }

    toast.success("Connexion réussie.");
    
    // On récupère la destination (soit du serveur, soit de l'URL, soit /dashboard par défaut)
    const urlRedirect = searchParams.get("redirectTo");
    const finalDestination = result.redirectTo ?? urlRedirect ?? "/dashboard";
    
    // On sécurise la redirection avec notre fonction
    router.push(getSafeRedirect(finalDestination));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground">
          Accédez à votre espace Loca.
        </p>
      </div>

      <GoogleAuthButton />

      {/* --- SÉPARATEUR --- */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            ou
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Connexion…" : "Se connecter"}
          </Button>
        </form>
      </Form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-muted-foreground hover:text-foreground"
        >
          Mot de passe oublié ?
        </Link>
        <p className="text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/auth/register"
            className="text-foreground font-medium hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
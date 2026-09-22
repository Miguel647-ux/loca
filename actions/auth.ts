"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

// ---------------------------------------------------------------
// Type de retour standard pour tous les Server Actions d'auth
// ---------------------------------------------------------------
export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ---------------------------------------------------------------
// LOGIN
// ---------------------------------------------------------------
export async function signIn(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Message générique — jamais d'erreur brute SQL ou Supabase
    return {
      success: false,
      error: "Email ou mot de passe incorrect.",
    };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// ---------------------------------------------------------------
// REGISTER
// IMPORTANT : on n'envoie JAMAIS de rôle. Le trigger SQL force owner.
// ---------------------------------------------------------------
export async function signUp(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        phone: parsed.data.phone || null,
        // AUCUN rôle n'est transmis — le trigger SQL impose 'owner'
      },
    },
  });

  if (error) {
    return {
      success: false,
      error:
        "Impossible de créer le compte. Vérifiez vos informations ou réessayez.",
    };
  }

  return {
    success: true,
    message:
      "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.",
  };
}

// ---------------------------------------------------------------
// LOGOUT
// ---------------------------------------------------------------
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

// ---------------------------------------------------------------
// FORGOT PASSWORD
// ---------------------------------------------------------------
export async function requestPasswordReset(
  input: ForgotPasswordInput
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Adresse email invalide.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: origin ? `${origin}/auth/callback?next=/auth/reset-password` : undefined,
  });

  // On renvoie toujours un succès — jamais révéler si l'email existe
  return {
    success: true,
    message:
      "Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé.",
  };
}

// ---------------------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------------------
export async function updatePassword(
  input: ResetPasswordInput
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Impossible de mettre à jour le mot de passe. Le lien est peut-être expiré.",
    };
  }

  return {
    success: true,
    message: "Mot de passe mis à jour. Vous pouvez maintenant vous connecter.",
  };
}
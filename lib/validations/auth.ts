import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis.")
    .email("Adresse email invalide.")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Le mot de passe est requis.")
    .max(200, "Mot de passe trop long."),
});

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Le prénom est requis.")
      .max(100, "Le prénom est trop long."),
    lastName: z
      .string()
      .trim()
      .min(1, "Le nom est requis.")
      .max(100, "Le nom est trop long."),
    phone: z
      .string()
      .trim()
      .min(3, "Numéro trop court.")
      .max(30, "Numéro trop long.")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .min(1, "L'email est requis.")
      .email("Adresse email invalide.")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(200, "Mot de passe trop long."),
    confirmPassword: z
      .string()
      .min(1, "La confirmation est requise."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "L'email est requis.")
    .email("Adresse email invalide.")
    .toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(200, "Mot de passe trop long."),
    confirmPassword: z
      .string()
      .min(1, "La confirmation est requise."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
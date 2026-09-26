import { z } from "zod";

// ============================================================
// TENANT
// Aligné sur la table public.tenants :
//   first_name  text NOT NULL (1-100 après trim)
//   last_name   text NOT NULL (1-100 après trim)
//   phone       text NOT NULL (3-30 après trim)
//   email       text nullable
//   id_number             text nullable
//   emergency_contact_name  text nullable
//   emergency_contact_phone text nullable
//   notes       text nullable
// user_id est volontairement EXCLU des formulaires :
// l'association à un compte se fera dans une phase ultérieure.
// ============================================================
export const tenantSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "Le prénom est requis.")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères."),
  last_name: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(100, "Le nom ne peut pas dépasser 100 caractères."),
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
  id_number: z
    .string()
    .trim()
    .max(50, "Le numéro d'identité est trop long.")
    .optional()
    .or(z.literal("")),
  emergency_contact_name: z
    .string()
    .trim()
    .max(150, "Nom trop long.")
    .optional()
    .or(z.literal("")),
  emergency_contact_phone: z
    .string()
    .trim()
    .max(30, "Téléphone trop long.")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères.")
    .optional()
    .or(z.literal("")),
});

export type TenantInput = z.infer<typeof tenantSchema>;

// ============================================================
// SEARCH
// ============================================================
export const tenantSearchSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(12).default(12),
});

export type TenantSearchParams = z.infer<typeof tenantSearchSchema>;
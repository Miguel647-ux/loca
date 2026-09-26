import { z } from "zod";

// ============================================================
// ENUM (aligné strictement sur public.lease_status)
// ============================================================
export const LEASE_STATUSES = [
  "pending",
  "active",
  "expired",
  "terminated",
] as const;

export type LeaseStatus = (typeof LEASE_STATUSES)[number];

export const LEASE_STATUS_LABELS: Record<LeaseStatus, string> = {
  pending: "En attente",
  active: "Actif",
  expired: "Expiré",
  terminated: "Terminé",
};

// ============================================================
// CREATE LEASE
// Aligné sur la table public.leases :
//   unit_id          uuid NOT NULL
//   tenant_id        uuid NOT NULL
//   start_date       date NOT NULL
//   end_date         date nullable (end_date >= start_date)
//   monthly_rent     numeric >= 0
//   deposit_amount   numeric >= 0 (default 0)
//   payment_due_day  smallint 1-31 (default 5)
//   status           enum, default 'pending'
//   notes            text nullable
// ============================================================
export const createLeaseSchema = z
  .object({
    unit_id: z.string().uuid("Unité invalide."),
    tenant_id: z.string().uuid("Locataire invalide."),
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de début invalide (YYYY-MM-DD)."),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de fin invalide (YYYY-MM-DD).")
      .nullable()
      .or(z.literal("")),
    monthly_rent: z
      .number({ message: "Le loyer doit être un nombre." })
      .min(0, "Le loyer ne peut pas être négatif.")
      .max(999_999_999.99, "Le loyer est trop élevé."),
    deposit_amount: z
      .number({ message: "Le dépôt doit être un nombre." })
      .min(0, "Le dépôt ne peut pas être négatif.")
      .max(999_999_999.99, "Le dépôt est trop élevé."),
    payment_due_day: z
      .number()
      .int("Le jour d'échéance doit être un entier.")
      .min(1, "Le jour doit être entre 1 et 31.")
      .max(31, "Le jour doit être entre 1 et 31."),
    status: z.enum(LEASE_STATUSES, {
      message: "Statut invalide.",
    }),
    notes: z
      .string()
      .trim()
      .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères.")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.end_date) return true;
      return data.end_date >= data.start_date;
    },
    {
      message: "La date de fin doit être postérieure ou égale à la date de début.",
      path: ["end_date"],
    }
  );

export type CreateLeaseInput = z.infer<typeof createLeaseSchema>;

// ============================================================
// UPDATE LEASE
// unit_id et tenant_id sont EXCLUS → immuables en V1.
// Seuls les paramètres du contrat sont modifiables.
// ============================================================
export const updateLeaseSchema = z
  .object({
    start_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de début invalide (YYYY-MM-DD)."),
    end_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de fin invalide (YYYY-MM-DD).")
      .nullable()
      .or(z.literal("")),
    monthly_rent: z
      .number()
      .min(0, "Le loyer ne peut pas être négatif.")
      .max(999_999_999.99, "Le loyer est trop élevé."),
    deposit_amount: z
      .number()
      .min(0, "Le dépôt ne peut pas être négatif.")
      .max(999_999_999.99, "Le dépôt est élevé."),
    payment_due_day: z
      .number()
      .int()
      .min(1, "Le jour doit être entre 1 et 31.")
      .max(31, "Le jour doit être entre 1 et 31."),
    status: z.enum(LEASE_STATUSES, {
      message: "Statut invalide.",
    }),
    notes: z
      .string()
      .trim()
      .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères.")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => {
      if (!data.end_date) return true;
      return data.end_date >= data.start_date;
    },
    {
      message: "La date de fin doit être postérieure ou égale à la date de début.",
      path: ["end_date"],
    }
  );

export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;

// ============================================================
// SEARCH
// ============================================================
export const leaseSearchSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  status: z.enum([...LEASE_STATUSES, "all"]).catch("all").default("all"),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(12).default(12),
});

export type LeaseSearchParams = z.infer<typeof leaseSearchSchema>;

// ============================================================
// END LEASE
// ============================================================
export const endLeaseSchema = z.object({
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de fin invalide (YYYY-MM-DD)."),
  notes: z
    .string()
    .trim()
    .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères.")
    .optional()
    .or(z.literal("")),
});

export type EndLeaseInput = z.infer<typeof endLeaseSchema>;
import { z } from "zod";

// ============================================================
// ENUMS (alignés strictement sur le schéma SQL)
// ============================================================
export const UNIT_STATUSES = ["available", "occupied", "maintenance"] as const;
export const UNIT_TYPES = [
  "apartment",
  "studio",
  "room",
  "house",
  "office",
  "shop",
  "other",
] as const;

export type UnitStatus = (typeof UNIT_STATUSES)[number];
export type UnitType = (typeof UNIT_TYPES)[number];

// ============================================================
// CREATE
// Aligné sur la table public.units :
//   unit_number    text NOT NULL
//   unit_type      enum NOT NULL default 'other'
//   monthly_rent   numeric(12,2) NOT NULL, >= 0
//   status         enum NOT NULL default 'available'
//   description    text
//   floor          integer, >= 0 ou null
//   area_m2        numeric(10,2), > 0 ou null
// ============================================================
export const createUnitSchema = z.object({
  property_id: z.string().uuid("Propriété invalide."),
  unit_number: z
    .string()
    .trim()
    .min(1, "Le numéro est requis.")
    .max(50, "Le numéro ne peut pas dépasser 50 caractères."),
  unit_type: z.enum(UNIT_TYPES, {
    message: "Type de logement invalide.",
  }),
  monthly_rent: z
    .number({ message: "Le loyer doit être un nombre." })
    .min(0, "Le loyer ne peut pas être négatif.")
    .max(999_999_999.99, "Le loyer est trop élevé."),
  status: z.enum(UNIT_STATUSES, {
    message: "Statut invalide.",
  }),
  description: z
    .string()
    .trim()
    .max(2000, "La description ne peut pas dépasser 2000 caractères.")
    .optional()
    .or(z.literal("")),
  floor: z
    .number()
    .int("L'étage doit être un entier.")
    .min(0, "L'étage ne peut pas être négatif.")
    .nullable(),
  area_m2: z
    .number()
    .positive("La surface doit être supérieure à 0.")
    .max(99_999.99, "La surface est trop élevée.")
    .nullable(),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;

// ============================================================
// UPDATE
// property_id est volontairement EXCLU → immutable en V1.
// ============================================================
export const updateUnitSchema = createUnitSchema
  .omit({ property_id: true })
  .extend({
    // Autorise aussi un changement de statut seul via le même schéma
  });

export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;

// ============================================================
// UPDATE STATUS (action rapide)
// ============================================================
export const updateUnitStatusSchema = z.object({
  status: z.enum(UNIT_STATUSES, {
    message: "Statut invalide.",
  }),
});

export type UpdateUnitStatusInput = z.infer<typeof updateUnitStatusSchema>;

// ============================================================
// SEARCH & FILTERS
// ============================================================
export const unitSearchSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  status: z.enum([...UNIT_STATUSES, "all"]).catch("all").default("all"),
  unit_type: z.enum([...UNIT_TYPES, "all"]).catch("all").default("all"),
});

export type UnitSearchParams = z.infer<typeof unitSearchSchema>;

// ============================================================
// LABELS FR pour l'UI
// ============================================================
export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  available: "Disponible",
  occupied: "Occupé",
  maintenance: "Maintenance",
};

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  apartment: "Appartement",
  studio: "Studio",
  room: "Chambre",
  house: "Maison",
  office: "Bureau",
  shop: "Boutique",
  other: "Autre",
};
import { z } from "zod";

// ============================================================
// PROPERTY
// Aligné sur la table public.properties :
//   name        text NOT NULL   (1-150 après trim)
//   description text
//   address     text NOT NULL
//   city        text NOT NULL
//   district    text
//   latitude    double precision  (-90..90 ou null)
//   longitude   double precision  (-180..180 ou null)
//
// ⚠️ Pas de z.preprocess / z.transform ici : RHF exige
//    input type === output type. La conversion des chaînes
//    en nombres se fait dans le onChange du formulaire.
// ============================================================
export const propertySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est requis.")
    .max(150, "Le nom ne peut pas dépasser 150 caractères."),
  description: z
    .string()
    .trim()
    .max(5000, "La description ne peut pas dépasser 5000 caractères.")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(1, "L'adresse est requise.")
    .max(500, "L'adresse ne peut pas dépasser 500 caractères."),
  city: z
    .string()
    .trim()
    .min(1, "La ville est requise.")
    .max(100, "La ville ne peut pas dépasser 100 caractères."),
  district: z
    .string()
    .trim()
    .max(100, "Le quartier ne peut pas dépasser 100 caractères.")
    .optional()
    .or(z.literal("")),
  latitude: z
    .number()
    .min(-90, "Latitude invalide (doit être entre -90 et 90).")
    .max(90, "Latitude invalide (doit être entre -90 et 90).")
    .nullable(),
  longitude: z
    .number()
    .min(-180, "Longitude invalide (doit être entre -180 et 180).")
    .max(180, "Longitude invalide (doit être entre -180 et 180).")
    .nullable(),
});

export type PropertyInput = z.infer<typeof propertySchema>;

// ============================================================
// SEARCH & PAGINATION
// ============================================================
export const propertySearchSchema = z.object({
  q: z.string().trim().max(200).catch("").default(""),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(12).default(12),
  status: z.enum(["active", "archived", "all"]).catch("active").default("active"),
});

export type PropertySearchParams = z.infer<typeof propertySearchSchema>;

// ============================================================
// PROPERTY IMAGES
// ============================================================
export const propertyImageMetaSchema = z.object({
  alt_text: z
    .string()
    .trim()
    .max(200, "L'alt text ne peut pas dépasser 200 caractères.")
    .optional()
    .or(z.literal("")),
  sort_order: z.coerce.number().int().min(0, "Ordre invalide.").default(0),
});

export type PropertyImageMetaInput = z.infer<typeof propertyImageMetaSchema>;

// ============================================================
// CONSTANTES UPLOAD (alignées sur les règles du document)
// ============================================================
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ACCEPTED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
] as const;
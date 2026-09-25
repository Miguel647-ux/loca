import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/validations/property";

export const PROPERTY_FILES_BUCKET = "loca-files";

export type UploadValidationResult =
  | { ok: true; extension: string }
  | { ok: false; error: string };

/**
 * Valide un fichier image côté serveur.
 * Contrôle : présence, MIME type, taille, extension.
 */
export function validateImageUpload(file: File): UploadValidationResult {
  if (!file || file.size === 0) {
    return { ok: false, error: "Fichier manquant ou vide." };
  }

  if (
    !ACCEPTED_IMAGE_TYPES.includes(
      file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
    )
  ) {
    return {
      ok: false,
      error: "Format non autorisé. Formats acceptés : JPEG, PNG, WEBP.",
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: "Fichier trop volumineux (5 Mo maximum)." };
  }

  const rawExt = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";

  if (
    !ACCEPTED_IMAGE_EXTENSIONS.includes(
      rawExt as (typeof ACCEPTED_IMAGE_EXTENSIONS)[number]
    )
  ) {
    return { ok: false, error: "Extension de fichier non autorisée." };
  }

  const extension = rawExt === "jpeg" ? "jpg" : rawExt;
  return { ok: true, extension };
}

/**
 * Construit un chemin Storage sûr : properties/<propertyId>/<uuid>.<ext>
 */
export function buildPropertyImagePath(
  propertyId: string,
  extension: string
): string {
  const safeExt = extension.replace(/[^a-z0-9]/gi, "").slice(0, 5);
  const filename = `${crypto.randomUUID()}.${safeExt}`;
  return `properties/${propertyId}/${filename}`;
}

/**
 * Client Supabase dédié aux opérations Storage côté serveur,
 * avec JWT explicite dans les headers globaux.
 *
 * Nécessaire car le client @supabase/ssr n'attache pas
 * systématiquement le token aux appels Storage en Server Action.
 */
export function createStorageClient(accessToken: string) {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
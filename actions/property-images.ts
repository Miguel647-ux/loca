"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  PROPERTY_FILES_BUCKET,
  buildPropertyImagePath,
  createStorageClient,
  validateImageUpload,
} from "@/lib/supabase/storage";
import { propertyImageMetaSchema } from "@/lib/validations/property";
import type { ActionResult } from "@/lib/action-result";
import type { PropertyImage } from "@/types/database";

// ============================================================
// HELPERS INTERNES
// ============================================================

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Non authentifié." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "owner") {
    return { ok: false as const, error: "Action réservée aux propriétaires." };
  }

  return { ok: true as const, supabase, userId: user.id };
}

async function assertPropertyOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  userId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: property } = await supabase
    .from("properties")
    .select("id, owner_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (!property) {
    return { ok: false, error: "Propriété introuvable." };
  }

  if (property.owner_id !== userId) {
    return { ok: false, error: "Accès refusé." };
  }

  return { ok: true };
}

async function getAccessToken(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { ok: false, error: "Session expirée. Reconnectez-vous." };
  }

  return { ok: true, token: session.access_token };
}

// ============================================================
// UPLOAD PROPERTY IMAGE
// ============================================================

export async function uploadPropertyImage(
  formData: FormData
): Promise<ActionResult<{ image: PropertyImage }>> {
  const propertyId = formData.get("propertyId");
  const file = formData.get("file");
  const altTextRaw = formData.get("alt_text");
  const sortOrderRaw = formData.get("sort_order");

  if (typeof propertyId !== "string" || !propertyId) {
    return { success: false, error: "Identifiant de propriété manquant." };
  }

  if (!(file instanceof File)) {
    return { success: false, error: "Fichier manquant." };
  }

  const validation = validateImageUpload(file);
  if (!validation.ok) {
    return { success: false, error: validation.error };
  }

  const parsedMeta = propertyImageMetaSchema.safeParse({
    alt_text: typeof altTextRaw === "string" ? altTextRaw : "",
    sort_order: typeof sortOrderRaw === "string" ? sortOrderRaw : 0,
  });

  if (!parsedMeta.success) {
    return {
      success: false,
      error: "Métadonnées d'image invalides.",
      fieldErrors: parsedMeta.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase, userId } = auth;

  const ownership = await assertPropertyOwnership(supabase, propertyId, userId);
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  const tokenResult = await getAccessToken(supabase);
  if (!tokenResult.ok) {
    return { success: false, error: tokenResult.error };
  }

  const path = buildPropertyImagePath(propertyId, validation.extension);
  const arrayBuffer = await file.arrayBuffer();

  const storageClient = createStorageClient(tokenResult.token);

  const { error: uploadError } = await storageClient.storage
    .from(PROPERTY_FILES_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadPropertyImage] storage error:", {
      message: uploadError.message,
      path,
    });
    return { success: false, error: "Impossible d'uploader l'image." };
  }

  // Insertion via RPC SECURITY DEFINER (contourne la récursion units ↔ leases)
  const { data: imageRow, error: insertError } = await supabase.rpc(
    "insert_my_property_image",
    {
      p_property_id: propertyId,
      p_storage_path: path,
      p_alt_text: parsedMeta.data.alt_text || null,
      p_sort_order: parsedMeta.data.sort_order,
    }
  );

  if (insertError || !imageRow) {
    // Nettoyage : on retire le fichier Storage orphelin
    await storageClient.storage.from(PROPERTY_FILES_BUCKET).remove([path]);
    console.error("[uploadPropertyImage] insert error:", insertError);
    return {
      success: false,
      error: "Impossible d'enregistrer l'image.",
    };
  }

  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { success: true, data: { image: imageRow as PropertyImage } };
}
// ============================================================
// UPDATE PROPERTY IMAGE META
// ============================================================

export async function updatePropertyImageMeta(
  imageId: string,
  rawInput: unknown
): Promise<ActionResult<{ image: PropertyImage }>> {
  if (!imageId || typeof imageId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const parsed = propertyImageMetaSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Métadonnées invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase, userId } = auth;

  const { data: existing } = await supabase
    .from("property_images")
    .select("id, property_id, properties!inner(owner_id)")
    .eq("id", imageId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Image introuvable." };
  }

  const nested = (existing as unknown as {
    properties: { owner_id: string };
  }).properties;

  if (!nested || nested.owner_id !== userId) {
    return { success: false, error: "Accès refusé." };
  }

  const { data, error } = await supabase
    .from("property_images")
    .update({
      alt_text: parsed.data.alt_text || null,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", imageId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Impossible de mettre à jour l'image." };
  }

  revalidatePath(`/dashboard/properties/${existing.property_id}`);
  return { success: true, data: { image: data as PropertyImage } };
}

// ============================================================
// DELETE PROPERTY IMAGE
// ============================================================

export async function deletePropertyImage(
  imageId: string
): Promise<ActionResult> {
  if (!imageId || typeof imageId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  // 1. Vérifier appartenance + récupérer storage_path via RPC SECURITY DEFINER
  const { data: rows, error: rpcError } = await supabase.rpc(
    "get_my_property_image_for_delete",
    { p_image_id: imageId }
  );

  if (rpcError || !rows || rows.length === 0) {
    return { success: false, error: "Image introuvable." };
  }

  const row = rows[0] as { storage_path: string; property_id: string };

  // 2. Supprimer le fichier Storage
  const tokenResult = await getAccessToken(supabase);
  if (!tokenResult.ok) {
    return { success: false, error: tokenResult.error };
  }

  const storageClient = createStorageClient(tokenResult.token);
  const { error: storageError } = await storageClient.storage
    .from(PROPERTY_FILES_BUCKET)
    .remove([row.storage_path]);

  if (storageError) {
    console.error("[deletePropertyImage] storage error:", storageError);
    return {
      success: false,
      error: "Impossible de supprimer le fichier image.",
    };
  }

  // 3. Supprimer la ligne en base (policy DELETE, sans récursion)
  const { error: dbError } = await supabase.rpc("delete_my_property_image",{
    p_image_id: imageId,
  });

  if (dbError) {
    console.error("[deletePropertyImage] DB error:", dbError);
    return {
      success: false,
      error: "Impossible de supprimer l'enregistrement.",
    };
  }

  revalidatePath(`/dashboard/properties/${row.property_id}`);
  return { success: true, message: "Image supprimée." };
}

// ============================================================
// GET SIGNED URL
// ============================================================

export async function getPropertyImageSignedUrl(
  storagePath: string,
  expiresIn: number = 600
): Promise<ActionResult<{ url: string }>> {
  if (!storagePath || typeof storagePath !== "string") {
    return { success: false, error: "Chemin invalide." };
  }

  const supabase = await createClient();
  const tokenResult = await getAccessToken(supabase);
  if (!tokenResult.ok) {
    return { success: false, error: tokenResult.error };
  }

  const storageClient = createStorageClient(tokenResult.token);
  const { data, error } = await storageClient.storage
    .from(PROPERTY_FILES_BUCKET)
    .createSignedUrl(storagePath, expiresIn);

  if (error || !data) {
    return { success: false, error: "Impossible de générer l'URL." };
  }

  return { success: true, data: { url: data.signedUrl } };
}

// ============================================================
// GET BATCH SIGNED URLS
// ============================================================

export async function getPropertyImagesSignedUrls(
  storagePaths: string[],
  expiresIn: number = 600
): Promise<ActionResult<{ urls: Record<string, string> }>> {
  if (!Array.isArray(storagePaths) || storagePaths.length === 0) {
    return { success: true, data: { urls: {} } };
  }

  if (storagePaths.length > 100) {
    return { success: false, error: "Trop d'images demandées." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const tokenResult = await getAccessToken(supabase);
  if (!tokenResult.ok) {
    return { success: false, error: tokenResult.error };
  }

  const storageClient = createStorageClient(tokenResult.token);
  const { data, error } = await storageClient.storage
    .from(PROPERTY_FILES_BUCKET)
    .createSignedUrls(storagePaths, expiresIn);

  if (error || !data) {
    return { success: false, error: "Impossible de générer les URLs." };
  }

  const urls: Record<string, string> = {};
  for (const entry of data) {
    if (entry.signedUrl && entry.path) {
      urls[entry.path] = entry.signedUrl;
    }
  }

  return { success: true, data: { urls } };
}
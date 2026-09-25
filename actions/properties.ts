"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { propertySchema, propertySearchSchema } from "@/lib/validations/property";
import type { ActionResult } from "@/lib/action-result";
import type {
  Property,
  PropertyImage,
  PropertyWithStats,
  Unit,
} from "@/types/database";

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

// ============================================================
// GET PROPERTIES — liste paginée + recherche + filtre statut
// RLS filtre déjà sur owner_id = auth.uid() (ou admin).
// ============================================================

export type GetPropertiesResult = {
  items: PropertyWithStats[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getProperties(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetPropertiesResult>> {
  const parsed = propertySearchSchema.safeParse(rawParams);
  if (!parsed.success) {
    return { success: false, error: "Paramètres de recherche invalides." };
  }

  const { q, page, pageSize, status } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // 1. Liste des propriétés (RLS properties_select OK, pas de récursion)
  let query = supabase.from("properties").select("*", { count: "exact" });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (q) {
    const escaped = q.replace(/[%_]/g, "\\$&");
    query = query.or(
      `name.ilike.%${escaped}%,city.ilike.%${escaped}%,address.ilike.%${escaped}%,district.ilike.%${escaped}%`
    );
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data: properties, error, count } = await query;

  if (error) {
    return {
      success: false,
      error: "Impossible de charger les propriétés.",
    };
  }

  const propertyIds = (properties ?? []).map((p) => p.id);

  // 2. Images via RPC (contourne la récursion units ↔ leases)
  const imagesByProperty: Record<string, PropertyImage[]> = {};

  if (propertyIds.length > 0) {
    const { data: images, error: imgError } = await supabase.rpc(
      "list_my_property_images",
      { p_property_ids: propertyIds }
    );

    if (imgError) {
      // On n'échoue pas la page pour ça — log serveur, liste sans images
      console.error("[getProperties] images RPC error:", imgError);
    }

    if (images) {
      for (const img of images as PropertyImage[]) {
        if (!imagesByProperty[img.property_id]) {
          imagesByProperty[img.property_id] = [];
        }
        imagesByProperty[img.property_id].push(img);
      }
    }
  }

  // 3. Comptage logements via RPC
  const unitsCounts: Record<
    string,
    { total: number; occupied: number; available: number }
  > = {};

  if (propertyIds.length > 0) {
    const { data: counts, error: unitsError } = await supabase.rpc(
      "count_my_property_units",
      { p_property_ids: propertyIds }
    );

    if (unitsError) {
      console.error("[getProperties] units RPC error:", unitsError);
    }

    if (counts) {
      for (const c of counts as Array<{
        property_id: string;
        total: number;
        occupied: number;
        available: number;
      }>) {
        unitsCounts[c.property_id] = {
          total: c.total,
          occupied: c.occupied,
          available: c.available,
        };
      }
    }
  }

  const items: PropertyWithStats[] = (properties ?? []).map((p) => {
    const counts = unitsCounts[p.id] ?? {
      total: 0,
      occupied: 0,
      available: 0,
    };
    return {
      ...(p as Property),
      property_images: imagesByProperty[p.id] ?? [],
      units_count: counts.total,
      units_occupied: counts.occupied,
      units_available: counts.available,
    };
  });

  return {
    success: true,
    data: {
      items,
      total: count ?? 0,
      page,
      pageSize,
    },
  };
}
// ============================================================
// GET PROPERTY — détail
// RLS empêche de lire une propriété d'un autre owner.
// ============================================================

export type GetPropertyResult = {
  property: Property & { property_images: PropertyImage[] };
  units: Unit[];
};

export async function getProperty(
  propertyId: string
): Promise<ActionResult<GetPropertyResult>> {
  if (!propertyId || typeof propertyId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  // 1. Propriété seule (RLS properties_select)
  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .maybeSingle();

  if (propError) {
    return { success: false, error: "Impossible de charger la propriété." };
  }

  if (!property) {
    return { success: false, error: "Propriété introuvable." };
  }

  // 2. Images via RPC (contourne récursion units ↔ leases)
  const { data: images, error: imgError } = await supabase.rpc(
    "list_my_property_images",
    { p_property_ids: [propertyId] }
  );

  if (imgError) {
    console.error("[getProperty] images RPC error:", imgError);
  }

  const property_images: PropertyImage[] = ((images ?? []) as PropertyImage[])
    .slice()
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        a.created_at.localeCompare(b.created_at)
    );

  // 3. Logements via RPC
  const { data: units, error: unitsError } = await supabase.rpc(
    "list_my_property_units",
    { p_property_id: propertyId }
  );

  if (unitsError) {
    console.error("[getProperty] units RPC error:", unitsError);
  }

  return {
    success: true,
    data: {
      property: { ...(property as Property), property_images },
      units: (units ?? []) as Unit[],
    },
  };
}
// ============================================================
// GET PROPERTY UNITS — lecture seule (pour le détail)
// ============================================================

export async function getPropertyUnits(
  propertyId: string
): Promise<ActionResult<Unit[]>> {
  if (!propertyId || typeof propertyId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { data, error } = await supabase.rpc("list_my_property_units", {
    p_property_id: propertyId,
  });

  if (error) {
    console.error("[getPropertyUnits] RPC error:", error);
    return { success: false, error: "Impossible de charger les logements." };
  }

  return { success: true, data: (data ?? []) as Unit[] };
}

// ============================================================
// CREATE PROPERTY
// owner_id est imposé côté serveur (jamais depuis le client).
// ============================================================

export async function createProperty(
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = propertySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase, userId } = auth;

  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: userId, // ← imposé côté serveur
      name: parsed.data.name,
      description: parsed.data.description || null,
      address: parsed.data.address,
      city: parsed.data.city,
      district: parsed.data.district || null,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      status: "active", // ← valeur par défaut explicite (alignée sur le SQL)
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: "Impossible de créer la propriété. Vérifiez les informations saisies.",
    };
  }

  revalidatePath("/dashboard/properties");
  return { success: true, data: { id: data.id } };
}

// ============================================================
// UPDATE PROPERTY
// On cible par id + on laisse RLS filtrer.
// On ne modifie NI owner_id NI status (réservé à archiveProperty).
// ============================================================

export async function updateProperty(
  propertyId: string,
  rawInput: unknown
): Promise<ActionResult<{ id: string }>> {
  if (!propertyId || typeof propertyId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const parsed = propertySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  // Defense in depth : on vérifie explicitement la propriété avant mutation.
  // RLS le ferait, mais on veut un message d'erreur distinct.
  const { data: existing } = await supabase
    .from("properties")
    .select("id, owner_id")
    .eq("id", propertyId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Propriété introuvable." };
  }

  if (existing.owner_id !== auth.userId) {
    return { success: false, error: "Accès refusé." };
  }

  const { data, error } = await supabase
    .from("properties")
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
      address: parsed.data.address,
      city: parsed.data.city,
      district: parsed.data.district || null,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    })
    .eq("id", propertyId)
    .select("id")
    .single();

  if (error || !data) {
    return {
      success: false,
      error: "Impossible de mettre à jour la propriété.",
    };
  }

  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { success: true, data: { id: data.id } };
}

// ============================================================
// ARCHIVE PROPERTY
// Passe status de 'active' à 'archived'.
// Le schéma SQL prévoit ce statut — aucune suppression physique.
// ============================================================

export async function archiveProperty(
  propertyId: string
): Promise<ActionResult> {
  if (!propertyId || typeof propertyId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  const { data: existing } = await supabase
    .from("properties")
    .select("id, owner_id, status")
    .eq("id", propertyId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Propriété introuvable." };
  }

  if (existing.owner_id !== auth.userId) {
    return { success: false, error: "Accès refusé." };
  }

  if (existing.status === "archived") {
    return { success: true, message: "La propriété est déjà archivée." };
  }

  const { error } = await supabase
    .from("properties")
    .update({ status: "archived" })
    .eq("id", propertyId);

  if (error) {
    return { success: false, error: "Impossible d'archiver la propriété." };
  }

  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { success: true, message: "Propriété archivée." };
}
// ============================================================
// UNARCHIVE PROPERTY
// Repasse status de 'archived' à 'active'.
// ============================================================

export async function unarchiveProperty(
  propertyId: string
): Promise<ActionResult> {
  if (!propertyId || typeof propertyId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  const { data: existing } = await supabase
    .from("properties")
    .select("id, owner_id, status")
    .eq("id", propertyId)
    .maybeSingle();

  if (!existing) {
    return { success: false, error: "Propriété introuvable." };
  }

  if (existing.owner_id !== auth.userId) {
    return { success: false, error: "Accès refusé." };
  }

  if (existing.status === "active") {
    return { success: true, message: "La propriété est déjà active." };
  }

  const { error } = await supabase
    .from("properties")
    .update({ status: "active" })
    .eq("id", propertyId);

  if (error) {
    return { success: false, error: "Impossible de réactiver la propriété." };
  }

  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { success: true, message: "Propriété réactivée." };
}
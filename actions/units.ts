"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  createUnitSchema,
  updateUnitSchema,
  updateUnitStatusSchema,
  type CreateUnitInput,
  type UpdateUnitInput,
  type UpdateUnitStatusInput,
} from "@/lib/validations/unit";
import type { ActionResult } from "@/lib/action-result";
import type { Unit } from "@/types/database";

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

// ============================================================
// GET UNITS (liste d'une propriété)
// Réutilise la RPC existante de Phase 3
// ============================================================

export async function getUnits(
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
    console.error("[getUnits] RPC error:", error);
    return { success: false, error: "Impossible de charger les logements." };
  }

  return { success: true, data: (data ?? []) as Unit[] };
}

// ============================================================
// GET UNIT (détail d'une unité)
// ============================================================

export async function getUnit(
  unitId: string
): Promise<ActionResult<Unit>> {
  if (!unitId || typeof unitId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non authentifié." };
  }

  const { data, error } = await supabase.rpc("get_my_unit", {
    p_unit_id: unitId,
  });

  if (error) {
    console.error("[getUnit] RPC error:", error);
    return { success: false, error: "Impossible de charger le logement." };
  }

  // RPC renvoie un setof → tableau ; on prend la 1ère ligne
  const unit = Array.isArray(data) ? data[0] : data;
  if (!unit) {
    return { success: false, error: "Logement introuvable." };
  }

  return { success: true, data: unit as Unit };
}

// ============================================================
// CREATE UNIT
// ============================================================

export async function createUnit(
  input: CreateUnitInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = createUnitSchema.safeParse(input);
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

  // Double vérification ownership côté serveur (défense en profondeur)
  const ownership = await assertPropertyOwnership(
    supabase,
    parsed.data.property_id,
    userId
  );
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  const { data, error } = await supabase.rpc("insert_my_unit", {
    p_property_id: parsed.data.property_id,
    p_unit_number: parsed.data.unit_number,
    p_unit_type: parsed.data.unit_type,
    p_monthly_rent: parsed.data.monthly_rent,
    p_status: parsed.data.status,
    p_description: parsed.data.description || null,
    p_floor: parsed.data.floor,
    p_area_m2: parsed.data.area_m2,
  });

  if (error) {
    console.error("[createUnit] RPC error:", error);
    // 23505 = duplicate key (property_id, unit_number)
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce numéro de logement existe déjà dans cette propriété.",
        fieldErrors: { unit_number: ["Ce numéro est déjà utilisé."] },
      };
    }
    return { success: false, error: "Impossible de créer le logement." };
  }

  const row = Array.isArray(data) ? data[0] : data;
  revalidatePath(`/dashboard/properties/${parsed.data.property_id}`);
  revalidatePath("/dashboard/units");
  return { success: true, data: { id: (row as Unit).id } };
}

// ============================================================
// UPDATE UNIT
// ============================================================

export async function updateUnit(
  unitId: string,
  input: UpdateUnitInput
): Promise<ActionResult<{ id: string }>> {
  if (!unitId || typeof unitId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const parsed = updateUnitSchema.safeParse(input);
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

  // On récupère d'abord l'unité pour connaître sa propriété
  // et vérifier l'ownership explicitement.
  const { data: existing, error: fetchError } = await supabase.rpc(
    "get_my_unit",
    { p_unit_id: unitId }
  );

  if (fetchError) {
    return { success: false, error: "Impossible de charger le logement." };
  }

  const existingUnit = Array.isArray(existing) ? existing[0] : existing;
  if (!existingUnit) {
    return { success: false, error: "Logement introuvable." };
  }

  const { data, error } = await supabase.rpc("update_my_unit", {
    p_unit_id: unitId,
    p_unit_number: parsed.data.unit_number,
    p_unit_type: parsed.data.unit_type,
    p_monthly_rent: parsed.data.monthly_rent,
    p_status: parsed.data.status,
    p_description: parsed.data.description || null,
    p_floor: parsed.data.floor,
    p_area_m2: parsed.data.area_m2,
  });

  if (error) {
    console.error("[updateUnit] RPC error:", error);
    if (error.code === "23505") {
      return {
        success: false,
        error: "Ce numéro de logement existe déjà dans cette propriété.",
        fieldErrors: { unit_number: ["Ce numéro est déjà utilisé."] },
      };
    }
    return {
      success: false,
      error: "Impossible de mettre à jour le logement.",
    };
  }

  const row = Array.isArray(data) ? data[0] : data;
  revalidatePath(`/dashboard/properties/${(existingUnit as Unit).property_id}`);
  revalidatePath(`/dashboard/properties/${(existingUnit as Unit).property_id}/units/${unitId}/edit`);
  revalidatePath("/dashboard/units");
  return { success: true, data: { id: (row as Unit).id } };
}

// ============================================================
// UPDATE UNIT STATUS (action rapide)
// ============================================================

export async function updateUnitStatus(
  unitId: string,
  input: UpdateUnitStatusInput
): Promise<ActionResult> {
  if (!unitId || typeof unitId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const parsed = updateUnitStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Statut invalide.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  const { data: existing } = await supabase.rpc("get_my_unit", {
    p_unit_id: unitId,
  });
  const existingUnit = Array.isArray(existing) ? existing[0] : existing;
  if (!existingUnit) {
    return { success: false, error: "Logement introuvable." };
  }

  const { error } = await supabase.rpc("update_my_unit_status", {
    p_unit_id: unitId,
    p_status: parsed.data.status,
  });

  if (error) {
    console.error("[updateUnitStatus] RPC error:", error);
    return { success: false, error: "Impossible de mettre à jour le statut." };
  }

  revalidatePath(`/dashboard/properties/${(existingUnit as Unit).property_id}`);
  revalidatePath("/dashboard/units");
  return { success: true, message: "Statut mis à jour." };
}

// ============================================================
// DELETE UNIT
// ============================================================

export async function deleteUnit(unitId: string): Promise<ActionResult> {
  if (!unitId || typeof unitId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const auth = await requireOwner();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const { supabase } = auth;

  const { data: existing } = await supabase.rpc("get_my_unit", {
    p_unit_id: unitId,
  });
  const existingUnit = Array.isArray(existing) ? existing[0] : existing;
  if (!existingUnit) {
    return { success: false, error: "Logement introuvable." };
  }

  const { error } = await supabase.rpc("delete_my_unit", {
    p_unit_id: unitId,
  });

  if (error) {
    console.error("[deleteUnit] RPC error:", error);
    // 23503 = FK violation → un bail référence cette unité
    if (error.code === "23503") {
      return {
        success: false,
        error:
          "Impossible de supprimer ce logement : un bail y est associé. Terminez d'abord le bail.",
      };
    }
    return { success: false, error: "Impossible de supprimer le logement." };
  }

  revalidatePath(`/dashboard/properties/${(existingUnit as Unit).property_id}`);
  revalidatePath("/dashboard/units");
  return { success: true, message: "Logement supprimé." };
}
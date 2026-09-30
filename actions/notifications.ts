"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { notificationSearchSchema } from "@/lib/validations/notification";
import type { ActionResult } from "@/lib/action-result";
import type { Notification } from "@/types/database";

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export type GetNotificationsResult = {
  items: Notification[];
  total: number;
  unread: number;
  page: number;
  pageSize: number;
};

export async function getNotifications(
  rawParams: Record<string, unknown>
): Promise<ActionResult<GetNotificationsResult>> {
  const parsed = notificationSearchSchema.safeParse(rawParams);
  if (!parsed.success) return { success: false, error: "Paramètres invalides." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("list_my_notifications", {
    p_filter: parsed.data.filter,
    p_page: parsed.data.page,
    p_page_size: parsed.data.pageSize,
  });

  if (error) {
    console.error("[getNotifications] RPC error:", error);
    return { success: false, error: "Impossible de charger les notifications." };
  }

  const result = data as GetNotificationsResult | null;

  return {
    success: true,
    data: {
      items: result?.items ?? [],
      total: result?.total ?? 0,
      unread: result?.unread ?? 0,
      page: result?.page ?? 1,
      pageSize: result?.pageSize ?? 20,
    },
  };
}

// ============================================================
// UNREAD COUNT
// ============================================================

export async function getUnreadNotificationsCount(): Promise<
  ActionResult<{ count: number }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("unread_notifications_count");

  if (error) {
    console.error("[getUnreadNotificationsCount] RPC error:", error);
    return { success: false, error: "Impossible de compter les notifications." };
  }

  return { success: true, data: { count: (data as number) ?? 0 } };
}

// ============================================================
// MARK AS READ
// ============================================================

export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult> {
  if (!notificationId || typeof notificationId !== "string") {
    return { success: false, error: "Identifiant invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: notificationId,
  });

  if (error) {
    console.error("[markNotificationAsRead] RPC error:", error);
    return { success: false, error: "Impossible de marquer comme lu." };
  }

  revalidatePath("/dashboard/notifications");
  return { success: true };
}

// ============================================================
// MARK ALL AS READ
// ============================================================

export async function markAllNotificationsAsRead(): Promise<
  ActionResult<{ count: number }>
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Non authentifié." };

  const { data, error } = await supabase.rpc("mark_all_notifications_read");

  if (error) {
    console.error("[markAllNotificationsRead] RPC error:", error);
    return { success: false, error: "Impossible de marquer comme lu." };
  }

  revalidatePath("/dashboard/notifications");
  return { success: true, data: { count: (data as number) ?? 0 } };
}
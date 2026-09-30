import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getNotifications } from "@/actions/notifications";
import { notificationSearchSchema } from "@/lib/validations/notification";
import { EmptyState, ErrorState } from "@/components/states";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationFilter } from "@/components/notifications/notification-filter";

export const metadata: Metadata = { title: "Notifications — Loca" };

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const raw = await searchParams;
  const parsed = notificationSearchSchema.safeParse({
    filter: typeof raw.filter === "string" ? raw.filter : "all",
    page: typeof raw.page === "string" ? raw.page : "1",
    pageSize: typeof raw.pageSize === "string" ? raw.pageSize : "20",
  });
  const params = parsed.success
    ? parsed.data
    : { filter: "all" as const, page: 1, pageSize: 20 };

  const result = await getNotifications(params);

  if (!result.success) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Notifications
        </h1>
        <ErrorState
          title="Impossible de charger les notifications"
          description={result.error}
        />
      </div>
    );
  }

  const { items, unread } = result.data!;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            {unread > 0
              ? `${unread} notification${unread > 1 ? "s" : ""} non lue${unread > 1 ? "s" : ""}`
              : "Tout est à jour."}
          </p>
        </div>
        <NotificationFilter />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description={
            params.filter === "unread"
              ? "Vous avez tout lu. Bravo !"
              : "Aucune notification pour l'instant."
          }
        />
      ) : (
        <NotificationList items={items} />
      )}
    </div>
  );
}
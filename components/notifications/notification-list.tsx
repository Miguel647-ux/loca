"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarClock,
  Check,
  CheckCheck,
  CreditCard,
  Info,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NOTIFICATION_TYPE_LABELS,
  type NotificationType,
} from "@/lib/validations/notification";
import type { Notification } from "@/types/database";

const ICONS: Record<NotificationType, typeof Bell> = {
  payment_received: CreditCard,
  rent_late: TriangleAlert,
  rent_due: CalendarClock,
  lease_expiring: CalendarClock,
  system: Info,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function NotificationList({ items }: { items: Notification[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const hasUnread = items.some((n) => n.read_at === null);

    async function handleClick(n: Notification) {
    // Marque comme lu (si pas déjà)
    if (!n.read_at) {
      setPending(n.id);
      await markNotificationAsRead(n.id);
      setPending(null);
    }

    // Navigue si un lien est défini
    if (n.link_url) {
      router.push(n.link_url);
      // Pas de router.refresh() ici : la navigation déclenche déjà un re-fetch
    } else {
      startTransition(() => router.refresh());
    }
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    const result = await markAllNotificationsAsRead();
    setMarkingAll(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(
      result.data?.count
        ? `${result.data.count} notification(s) marquée(s) comme lue(s).`
        : "Tout est déjà à jour."
    );
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      {hasUnread && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4" />
            )}
            Tout marquer comme lu
          </Button>
        </div>
      )}

      <div className="rounded-lg border bg-card divide-y overflow-hidden">
        {items.map((n) => {
          const Icon = ICONS[n.type as NotificationType] ?? Bell;
          const unread = n.read_at === null;
          const clickable = Boolean(n.link_url);

          return (
            <button
              key={n.id}
              type="button"
              onClick={() => handleClick(n)}
              disabled={pending === n.id}
              className={cn(
                "w-full text-left px-4 py-4 transition-colors hover:bg-muted/30 flex items-start gap-3 disabled:opacity-60",
                unread ? "bg-[var(--brand)]/5" : "",
                clickable ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full",
                  unread ? "bg-[var(--brand)]/15" : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "size-4",
                    unread ? "text-[var(--brand)]" : "text-muted-foreground"
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm truncate",
                      unread ? "font-semibold" : "font-medium"
                    )}
                  >
                    {n.title}
                  </p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 break-words">
                  {n.message}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    {NOTIFICATION_TYPE_LABELS[n.type as NotificationType] ??
                      n.type}
                  </p>
                  {clickable && (
                    <span className="text-[10px] text-[var(--brand)] font-medium">
                      Voir le détail →
                    </span>
                  )}
                </div>
              </div>

              {unread && (
                <span className="shrink-0 size-2 rounded-full bg-[var(--brand)] mt-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
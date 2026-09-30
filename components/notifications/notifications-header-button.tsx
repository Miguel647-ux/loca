import Link from "next/link";
import { Bell } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationsHeaderButton({
  href,
  unreadCount = 0,
}: {
  href: string;
  unreadCount?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={
        unreadCount > 0
          ? `${unreadCount} notification(s) non lue(s)`
          : "Notifications"
      }
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative"
      )}
    >
      <Bell className="size-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-[var(--brand)] text-[10px] font-medium text-[var(--brand-foreground)] flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
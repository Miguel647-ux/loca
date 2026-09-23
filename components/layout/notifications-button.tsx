import Link from "next/link";
import { Bell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotificationsButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Notifications"
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
    >
      <Bell className="size-4" />
    </Link>
  );
}
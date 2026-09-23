"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ownerNavItems,
  tenantNavItems,
  type NavItem,
} from "./nav-config";

export function SidebarContent({
  variant,
}: {
  variant: "owner" | "tenant";
}) {
  const pathname = usePathname();
  const items: NavItem[] =
    variant === "owner" ? ownerNavItems : tenantNavItems;

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isRoot =
          item.href === "/dashboard" || item.href === "/tenant";
        const isActive = isRoot
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {isActive && (
              <span className="ml-auto size-1.5 rounded-full bg-[var(--brand)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
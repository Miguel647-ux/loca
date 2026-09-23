"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SidebarContent } from "./sidebar-content";
import { NotificationsButton } from "./notifications-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu, type UserMenuProfile } from "./user-menu";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardHeader({
  variant,
  profile,
  notificationsHref,
  settingsHref,
  homeHref,
}: {
  variant: "owner" | "tenant";
  profile: UserMenuProfile;
  notificationsHref: string;
  settingsHref: string;
  homeHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="border-b px-4 py-3">
            <Logo href={homeHref} />
          </div>
          <SidebarContent variant={variant} />
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <NotificationsButton href={notificationsHref} />
      <ThemeToggle />
      <UserMenu profile={profile} settingsHref={settingsHref} />
    </header>
  );
}
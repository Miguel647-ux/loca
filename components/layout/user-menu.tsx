"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

import { signOut } from "@/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserMenuProfile = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
  role: "owner" | "tenant" | "admin";
};

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function UserMenu({
  profile,
  settingsHref,
}: {
  profile: UserMenuProfile;
  settingsHref: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    await signOut();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Menu utilisateur"
          />
        }
      >
        <Avatar className="size-7">
          {profile.avatarUrl && (
            <AvatarImage src={profile.avatarUrl} alt={profile.firstName} />
          )}
          <AvatarFallback className="text-xs">
            {initials(profile.firstName, profile.lastName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col px-2 py-1.5">
          <span className="text-sm font-medium">
            {profile.firstName} {profile.lastName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {profile.email}
          </span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(settingsHref)}>
          <UserIcon className="size-4" />
          <span>Mon profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(settingsHref)}>
          <Settings className="size-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          variant="destructive"
        >
          <LogOut className="size-4" />
          <span>{isPending ? "Déconnexion…" : "Se déconnecter"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
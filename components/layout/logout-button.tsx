"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    await signOut();
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut className="size-4" />
      <span className="hidden sm:inline">
        {isPending ? "Déconnexion…" : "Déconnexion"}
      </span>
    </Button>
  );
}
"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function AdminLogoutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    try {
      await signOut();
    } catch (error) {
      setIsPending(false);
    }
  }

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="size-4 mr-2 animate-spin" /> : <LogOut className="size-4 mr-2" />}
      Déconnexion
    </Button>
  );
}
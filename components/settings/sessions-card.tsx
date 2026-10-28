"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

import { signOutEverywhere } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SessionsCard() {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    setIsPending(true);
    await signOutEverywhere();
  }

  return (
    <div className="rounded-lg border bg-card p-5 space-y-3 max-w-2xl">
      <div>
        <h3 className="font-heading text-base font-semibold">
          Sessions actives
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Déconnectez-vous de tous les appareils où vous êtes connecté. Vous
          serez redirigé vers la page de connexion.
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={<Button variant="outline" className="text-destructive" />}
        >
          <LogOut className="size-4" />
          Déconnecter toutes les sessions
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Déconnecter toutes les sessions ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Toutes vos sessions actives sur cet appareil et sur les autres
              seront fermées. Vous devrez vous reconnecter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSignOut();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Déconnexion…
                </>
              ) : (
                "Confirmer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
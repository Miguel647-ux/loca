"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteUnit } from "@/actions/units";
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
import { Button } from "@/components/ui/button";

export function DeleteUnitDialog({
  unitId,
  unitNumber,
  propertyId,
  variant = "icon",
}: {
  unitId: string;
  unitNumber: string;
  propertyId: string;
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteUnit(unitId);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      setOpen(false);
      return;
    }

    toast.success(result.message ?? "Logement supprimé.");
    setOpen(false);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          variant === "icon" ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Supprimer le logement"
            />
          ) : (
            <Button variant="outline" size="sm" className="text-destructive" />
          )
        }
      >
        <Trash2 className="size-4" />
        {variant === "button" && <span>Supprimer</span>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Supprimer le logement « {unitNumber} » ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Si un bail est associé à ce
            logement, la suppression sera refusée automatiquement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Suppression…
              </>
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
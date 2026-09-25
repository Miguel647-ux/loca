"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";

import { archiveProperty, unarchiveProperty } from "@/actions/properties";
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

export function ArchivePropertyDialog({
  propertyId,
  propertyName,
  isArchived,
}: {
  propertyId: string;
  propertyName: string;
  isArchived: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleConfirm() {
    setIsPending(true);
    const result = isArchived
      ? await unarchiveProperty(propertyId)
      : await archiveProperty(propertyId);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      result.message ?? (isArchived ? "Propriété réactivée." : "Propriété archivée.")
    );
    setOpen(false);
    router.refresh();
  }

  const title = isArchived
    ? `Réactiver « ${propertyName} » ?`
    : `Archiver « ${propertyName} » ?`;

  const description = isArchived
    ? "Cette propriété passera au statut actif. Elle sera de nouveau traitée comme une propriété active."
    : "Cette propriété passera au statut archivé. Elle ne sera plus traitée comme une propriété active. Vous pourrez toujours la consulter en filtrant sur « Archivées ».";

  const confirmLabel = isArchived ? "Réactiver" : "Archiver";
  const pendingLabel = isArchived ? "Réactivation…" : "Archivage…";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={isArchived ? "" : "text-destructive"}
          />
        }
      >
        {isArchived ? (
          <>
            <ArchiveRestore className="size-4" />
            Réactiver
          </>
        ) : (
          <>
            <Archive className="size-4" />
            Archiver
          </>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
            className={
              isArchived
                ? ""
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
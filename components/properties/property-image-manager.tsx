"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deletePropertyImage } from "@/actions/property-images";
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
import type { PropertyImage } from "@/types/database";

export function PropertyImageManager({
  images,
  signedUrls,
}: {
  images: PropertyImage[];
  signedUrls: Record<string, string>;
}) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img) => (
        <ImageTile
          key={img.id}
          image={img}
          url={signedUrls[img.storage_path]}
        />
      ))}
    </div>
  );
}

function ImageTile({
  image,
  url,
}: {
  image: PropertyImage;
  url?: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setIsPending(true);
    const result = await deletePropertyImage(image.id);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Image supprimée.");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={image.alt_text ?? ""}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <ImageIcon className="size-6 text-muted-foreground/60" />
        </div>
      )}

      <div className="absolute inset-0 flex items-start justify-end bg-gradient-to-b from-black/40 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/20 hover:text-white"
                aria-label="Supprimer l’image"
              />
            }
          >
            <Trash2 className="size-4" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action supprime définitivement le fichier. Elle est
                irréversible.
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
      </div>
    </div>
  );
}
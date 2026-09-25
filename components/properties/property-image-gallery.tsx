"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { PropertyImage } from "@/types/database";

export function PropertyImageGallery({
  images,
  signedUrls,
}: {
  images: PropertyImage[];
  signedUrls: Record<string, string>;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/20 py-12">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <ImageIcon className="size-6" />
          <p className="text-sm">Aucune image</p>
        </div>
      </div>
    );
  }

  const openImage = openIndex !== null ? images[openIndex] : null;
  const openUrl = openImage ? signedUrls[openImage.storage_path] : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, idx) => {
          const url = signedUrls[img.storage_path];
          if (!url) return null;

          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpenIndex(idx)}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-colors hover:border-foreground/20"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={img.alt_text ?? ""}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
          );
        })}
      </div>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => !open && setOpenIndex(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {openUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={openUrl}
              alt={openImage?.alt_text ?? ""}
              className="max-h-[80vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
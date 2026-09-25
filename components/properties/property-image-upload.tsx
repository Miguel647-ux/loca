"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { uploadPropertyImage } from "@/actions/property-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/lib/validations/property";

export function PropertyImageUpload({
  propertyId,
  nextSortOrder,
}: {
  propertyId: string;
  nextSortOrder: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");

  function onSelect(f: File | null) {
    if (!f) {
      setFile(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(f.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      toast.error("Format non autorisé. Formats acceptés : JPEG, PNG, WEBP.");
      return;
    }

    if (f.size > MAX_IMAGE_SIZE) {
      toast.error("Fichier trop volumineux (5 Mo maximum).");
      return;
    }

    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsPending(true);

    const fd = new FormData();
    fd.set("propertyId", propertyId);
    fd.set("file", file);
    fd.set("alt_text", altText);
    fd.set("sort_order", String(nextSortOrder));

    const result = await uploadPropertyImage(fd);

    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Image ajoutée.");
    setFile(null);
    setAltText("");
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-dashed bg-muted/20 p-5 space-y-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted shrink-0">
          <ImagePlus className="size-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Ajouter une image</p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG ou WEBP — 5 Mo maximum.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="property-image-file" className="text-xs">
            Fichier
          </Label>
          <Input
            id="property-image-file"
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="property-image-alt" className="text-xs">
            Texte alternatif (optionnel)
          </Label>
          <Input
            id="property-image-alt"
            placeholder="Vue du salon"
            maxLength={200}
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={!file || isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Upload…
            </>
          ) : (
            "Ajouter l’image"
          )}
        </Button>
      </div>
    </form>
  );
}
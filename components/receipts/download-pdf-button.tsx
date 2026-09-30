"use client";

import { useState } from "react";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getReceiptSignedUrl } from "@/actions/receipts";
import { Button } from "@/components/ui/button";

export function DownloadReceiptPdfButton({
  storagePath,
}: {
  storagePath: string | null;
}) {
  const [isPending, setIsPending] = useState(false);

  async function handleDownload() {
    if (!storagePath) {
      toast.error("Le PDF n'est pas encore disponible.");
      return;
    }

    setIsPending(true);
    const result = await getReceiptSignedUrl(storagePath);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    window.open(result.data!.url, "_blank", "noopener,noreferrer");
  }

  // PDF non généré : message clair au lieu d'un bouton désactivé muet
  if (!storagePath) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <AlertCircle className="size-3.5" />
        PDF non disponible
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Chargement…
        </>
      ) : (
        <>
          <Download className="size-4" />
          Télécharger le PDF
        </>
      )}
    </Button>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createReceipt,
  generateAndStoreReceiptPdf,
} from "@/actions/receipts";
import { Button } from "@/components/ui/button";

export function GenerateReceiptButton({
  paymentId,
  variant = "default",
  redirectToReceipt = true,
}: {
  paymentId: string;
  variant?: "default" | "outline";
  redirectToReceipt?: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleGenerate() {
    setIsPending(true);

    const create = await createReceipt(paymentId);
    if (!create.success) {
      toast.error(create.error);
      setIsPending(false);
      return;
    }

    const pdf = await generateAndStoreReceiptPdf(create.data!.id);
    setIsPending(false);

    if (!pdf.success) {
      toast.error(pdf.error);
      if (redirectToReceipt) {
        router.push(`/dashboard/receipts/${create.data!.id}`);
      } else {
        router.refresh();
      }
      return;
    }

    toast.success("Reçu généré.");
    if (redirectToReceipt) {
      router.push(`/dashboard/receipts/${create.data!.id}`);
    } else {
      router.refresh();
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={isPending} variant={variant} size="sm">
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Génération…
        </>
      ) : (
        <>
          <FileText className="size-4" />
          Générer un reçu
        </>
      )}
    </Button>
  );
}
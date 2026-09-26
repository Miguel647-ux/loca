"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { endLease } from "@/actions/leases";
import { endLeaseSchema, type EndLeaseInput } from "@/lib/validations/lease";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function EndLeaseDialog({
  leaseId,
  tenantName,
  disabled = false,
}: {
  leaseId: string;
  tenantName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<EndLeaseInput>({
    resolver: zodResolver(endLeaseSchema),
    defaultValues: { end_date: todayISO(), notes: "" },
  });

  async function onSubmit(values: EndLeaseInput) {
    setIsPending(true);
    const result = await endLease(leaseId, values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(result.message ?? "Bail terminé.");
    setOpen(false);
    router.refresh();
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="outline" size="sm" disabled={disabled} />}
      >
        <LogOut className="size-4" />
        Terminer le bail
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terminer le bail de {tenantName} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le bail passera au statut « Terminé » et la date de fin sera enregistrée.
            L’historique du bail reste conservé. Le logement redeviendra disponible
            s’il n’a plus de bail actif.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="end_date">Date de fin *</Label>
            <Input id="end_date" type="date" {...form.register("end_date")} />
            {form.formState.errors.end_date && (
              <p className="text-xs text-destructive">{form.formState.errors.end_date.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_notes">Notes</Label>
            <Textarea id="end_notes" rows={3} maxLength={2000} {...form.register("notes")} />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>Annuler</AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? (<><Loader2 className="size-4 animate-spin" />Terminaison…</>) : "Confirmer"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
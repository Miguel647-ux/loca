"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { recordRentPayment } from "@/actions/rent-payments";
import {
  recordRentPaymentSchema,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type RecordRentPaymentInput,
  type PaymentMethod,
} from "@/lib/validations/rent-payment";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatCurrency(n: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  })
    .format(n)
    .concat(" FCFA");
}

export function RecordPaymentDialog({
  rentDueId,
  amountRemaining,
  disabled = false,
}: {
  rentDueId: string;
  amountRemaining: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);

  const form = useForm<RecordRentPaymentInput>({
    resolver: zodResolver(recordRentPaymentSchema),
    defaultValues: {
      rent_due_id: rentDueId,
      amount: amountRemaining > 0 ? amountRemaining : 0,
      payment_date: todayISO(),
      payment_method: "cash",
      reference: "",
      notes: "",
    },
  });

  async function onSubmit(values: RecordRentPaymentInput) {
    setIsPending(true);
    const result = await recordRentPayment(values);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Paiement enregistré.");
    setOpen(false);
    router.refresh();
  }

  const noRemaining = amountRemaining <= 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button size="sm" disabled={disabled || noRemaining} />
        }
      >
        <CreditCard className="size-4" />
        Enregistrer un paiement
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enregistrer un paiement</AlertDialogTitle>
          <AlertDialogDescription>
            Solde restant : <strong>{formatCurrency(amountRemaining)}</strong>.
            Le montant ne peut pas dépasser ce solde.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA) *</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                max={amountRemaining}
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date">Date *</Label>
              <Input
                id="payment_date"
                type="date"
                {...form.register("payment_date")}
              />
              {form.formState.errors.payment_date && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.payment_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Méthode *</Label>
            <Select
              value={form.watch("payment_method")}
              onValueChange={(v) =>
                form.setValue("payment_method", v as PaymentMethod)
              }
            >
              <SelectTrigger className="w-full h-9">
                <SelectValue>
                  {PAYMENT_METHOD_LABELS[form.watch("payment_method")]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Référence</Label>
            <Input
              id="reference"
              placeholder="N° de transaction, chèque…"
              maxLength={200}
              {...form.register("reference")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={3}
              maxLength={1000}
              {...form.register("notes")}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isPending}>
              Annuler
            </AlertDialogCancel>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Enregistrement…
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
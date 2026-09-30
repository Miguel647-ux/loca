import { z } from "zod";

// ============================================================
// ENUM (aligné strictement sur public.payment_method)
// ============================================================
export const PAYMENT_METHODS = [
  "cash",
  "bank_transfer",
  "mobile_money",
  "other",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Espèces",
  bank_transfer: "Virement bancaire",
  mobile_money: "Mobile Money",
  other: "Autre",
};

// ============================================================
// RECORD PAYMENT
// Aligné sur la table public.rent_payments :
//   rent_due_id     uuid NOT NULL
//   amount          numeric > 0
//   payment_date    date NOT NULL (default today)
//   payment_method  enum NOT NULL
//   reference       text nullable
//   notes           text nullable
//   recorded_by     uuid NOT NULL (imposé par la RPC — jamais côté client)
//
// ⚠️ Aucun contrôle sur le solde restant ici : c'est la RPC qui
//    verrouille la ligne et vérifie le solde réel.
// ============================================================
export const recordRentPaymentSchema = z.object({
  rent_due_id: z.string().uuid("Dette invalide."),
  amount: z
    .number({ message: "Le montant doit être un nombre." })
    .positive("Le montant doit être supérieur à zéro.")
    .max(999_999_999.99, "Le montant est trop élevé."),
  payment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de paiement invalide."),
  payment_method: z.enum(PAYMENT_METHODS, {
    message: "Méthode de paiement invalide.",
  }),
  reference: z
    .string()
    .trim()
    .max(200, "La référence ne peut pas dépasser 200 caractères.")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(1000, "Les notes ne peuvent pas dépasser 1000 caractères.")
    .optional()
    .or(z.literal("")),
});

export type RecordRentPaymentInput = z.infer<typeof recordRentPaymentSchema>;
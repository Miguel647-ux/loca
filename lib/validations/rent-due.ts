import { z } from "zod";

// ============================================================
// ENUM (aligné strictement sur public.due_status)
// ============================================================
export const DUE_STATUSES = [
  "pending",
  "partial",
  "paid",
  "late",
  "cancelled",
] as const;

export type DueStatus = (typeof DUE_STATUSES)[number];

export const DUE_STATUS_LABELS: Record<DueStatus, string> = {
  pending: "À payer",
  partial: "Partiel",
  paid: "Payé",
  late: "En retard",
  cancelled: "Annulé",
};

// ============================================================
// CREATE RENT DUE
// Aligné sur la table public.rent_due :
//   lease_id      uuid NOT NULL
//   period_start  date NOT NULL
//   period_end    date NOT NULL (>= period_start)
//   due_date      date NOT NULL
//   amount_due    numeric > 0
// ============================================================
export const createRentDueSchema = z
  .object({
    lease_id: z.string().uuid("Bail invalide."),
    period_start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de début de période invalide."),
    period_end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date de fin de période invalide."),
    due_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date d'échéance invalide."),
    amount_due: z
      .number({ message: "Le montant doit être un nombre." })
      .positive("Le montant doit être supérieur à zéro.")
      .max(999_999_999.99, "Le montant est trop élevé."),
  })
  .refine((data) => data.period_end >= data.period_start, {
    message:
      "La date de fin de période doit être postérieure ou égale à la date de début.",
    path: ["period_end"],
  });

export type CreateRentDueInput = z.infer<typeof createRentDueSchema>;

// ============================================================
// SEARCH / FILTERS
// ============================================================
export const rentDueSearchSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  status: z.enum([...DUE_STATUSES, "all"]).catch("all").default("all"),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(20).default(20),
});

export type RentDueSearchParams = z.infer<typeof rentDueSearchSchema>;

// ============================================================
// HELPER — calcul d'une période mensuelle à partir d'une date
// Retourne { start, end, dueDate } en ISO (YYYY-MM-DD)
// ============================================================
export function computeMonthlyPeriod(baseDate: Date) {
  const y = baseDate.getUTCFullYear();
  const m = baseDate.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 0));
  // Échéance par défaut : 5 du mois suivant, ajusté si > 28 pour les mois courts
  const dueDay = Math.min(5, end.getUTCDate());
  const due = new Date(Date.UTC(y, m + 1, dueDay));

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return {
    start: fmt(start),
    end: fmt(end),
    dueDate: fmt(due),
  };
}
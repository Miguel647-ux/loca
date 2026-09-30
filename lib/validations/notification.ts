import { z } from "zod";

export const NOTIFICATION_TYPES = [
  "rent_due",
  "rent_late",
  "payment_received",
  "lease_expiring",
  "system",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  rent_due: "Loyer à venir",
  rent_late: "Loyer en retard",
  payment_received: "Paiement reçu",
  lease_expiring: "Bail bientôt expiré",
  system: "Système",
};

export const notificationSearchSchema = z.object({
  filter: z.enum(["all", "unread", "read"]).catch("all").default("all"),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(20).default(20),
});

export type NotificationSearchParams = z.infer<typeof notificationSearchSchema>;
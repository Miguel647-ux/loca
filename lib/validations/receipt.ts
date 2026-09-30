import { z } from "zod";

// ============================================================
// RECEIPT SEARCH
// ============================================================
export const receiptSearchSchema = z.object({
  q: z.string().trim().max(100).catch("").default(""),
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(20).default(20),
});

export type ReceiptSearchParams = z.infer<typeof receiptSearchSchema>;
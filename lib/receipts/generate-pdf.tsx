import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptPdf } from "./pdf-template";
import type { ReceiptWithRelations } from "@/types/database";

export async function generateReceiptPdf(
  receipt: ReceiptWithRelations
): Promise<Buffer> {
  const buffer = await renderToBuffer(<ReceiptPdf receipt={receipt} />);
  return Buffer.from(buffer);
}
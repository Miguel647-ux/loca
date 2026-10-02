import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  paid: "Payé",
  partial: "Partiel",
  pending: "À payer",
  late: "En retard",
  cancelled: "Annulé",
};

const VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  paid: "default",
  partial: "outline",
  pending: "secondary",
  late: "destructive",
  cancelled: "outline",
};

export function TenantDueStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"}>
      {LABELS[status] ?? status}
    </Badge>
  );
}
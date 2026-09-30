import { Badge } from "@/components/ui/badge";
import {
  DUE_STATUS_LABELS,
  type DueStatus,
} from "@/lib/validations/rent-due";

const VARIANTS: Record<
  DueStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  paid: "default",
  pending: "secondary",
  partial: "outline",
  late: "destructive",
  cancelled: "outline",
};

export function DueStatusBadge({ status }: { status: DueStatus }) {
  return <Badge variant={VARIANTS[status]}>{DUE_STATUS_LABELS[status]}</Badge>;
}
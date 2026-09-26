import { Badge } from "@/components/ui/badge";
import {
  UNIT_STATUS_LABELS,
  type UnitStatus,
} from "@/lib/validations/unit";

const STATUS_VARIANTS: Record<
  UnitStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  available: "outline",
  occupied: "default",
  maintenance: "secondary",
};

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {UNIT_STATUS_LABELS[status]}
    </Badge>
  );
}
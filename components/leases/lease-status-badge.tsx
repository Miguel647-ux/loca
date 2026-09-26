import { Badge } from "@/components/ui/badge";
import { LEASE_STATUS_LABELS, type LeaseStatus } from "@/lib/validations/lease";

const VARIANTS: Record<LeaseStatus, "default" | "secondary" | "outline" | "destructive"> = {
  active: "default",
  pending: "secondary",
  expired: "outline",
  terminated: "outline",
};

export function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  return <Badge variant={VARIANTS[status]}>{LEASE_STATUS_LABELS[status]}</Badge>;
}
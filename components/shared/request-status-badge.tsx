import { Badge } from "@/components/ui/badge"
import type { RequestStatus } from "@/lib/types"

import { PILL_COLORS } from "./pill-colors"

const STATUSES: Record<RequestStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: PILL_COLORS.yellow },
  APPROVED: { label: "Approved", className: PILL_COLORS.emerald },
  ACTIVE: { label: "Active", className: PILL_COLORS.blue },
  COMPLETED: { label: "Completed", className: PILL_COLORS.gray },
  REJECTED: { label: "Rejected", className: PILL_COLORS.red },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
}

export const requestStatusLabel = (status: RequestStatus) => STATUSES[status].label

// The badge's colours on their own, for other elements that show a status
export const requestStatusColors = (status: RequestStatus) => STATUSES[status].className

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const { label, className } = STATUSES[status]

  return <Badge className={className}>{label}</Badge>
}

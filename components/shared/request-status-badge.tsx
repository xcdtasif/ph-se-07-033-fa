import { Badge } from "@/components/ui/badge"
import type { RequestStatus } from "@/lib/types"

const STATUSES: Record<RequestStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
  ACTIVE: { label: "Active", className: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "Completed", className: "bg-gray-200 text-gray-800" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground" },
}

export const requestStatusLabel = (status: RequestStatus) => STATUSES[status].label

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const { label, className } = STATUSES[status]

  return <Badge className={className}>{label}</Badge>
}

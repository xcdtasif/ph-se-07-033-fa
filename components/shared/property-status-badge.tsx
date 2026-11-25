import { Badge } from "@/components/ui/badge"
import type { PropertyStatus } from "@/lib/types"

import { PILL_COLORS } from "./pill-colors"

const STATUSES: Record<PropertyStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: PILL_COLORS.emerald },
  RESERVED: { label: "Reserved", className: PILL_COLORS.amber },
  RENTED: { label: "Rented", className: PILL_COLORS.blue },
  UNAVAILABLE: { label: "Unavailable", className: "bg-muted text-muted-foreground" },
}

export const propertyStatusLabel = (status: PropertyStatus) => STATUSES[status].label

// The badge's colours on their own, for other elements that show a status
export const propertyStatusColors = (status: PropertyStatus) => STATUSES[status].className

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { label, className } = STATUSES[status]

  return <Badge className={className}>{label}</Badge>
}

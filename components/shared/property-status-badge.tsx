import { Badge } from "@/components/ui/badge"
import type { PropertyStatus } from "@/lib/types"

const STATUSES: Record<PropertyStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "bg-emerald-100 text-emerald-800" },
  RESERVED: { label: "Reserved", className: "bg-amber-100 text-amber-800" },
  RENTED: { label: "Rented", className: "bg-blue-100 text-blue-800" },
  UNAVAILABLE: { label: "Unavailable", className: "bg-muted text-muted-foreground" },
}

export const propertyStatusLabel = (status: PropertyStatus) => STATUSES[status].label

// The badge's colours on their own, for other elements that show a status
export const propertyStatusColors = (status: PropertyStatus) => STATUSES[status].className

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { label, className } = STATUSES[status]

  return <Badge className={className}>{label}</Badge>
}

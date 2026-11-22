import { Badge } from "@/components/ui/badge"
import type { PropertyStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUSES: Record<PropertyStatus, { label: string; text: string; background: string }> = {
  AVAILABLE: { label: "Available", text: "text-emerald-800", background: "bg-emerald-100" },
  RESERVED: { label: "Reserved", text: "text-amber-800", background: "bg-amber-100" },
  RENTED: { label: "Rented", text: "text-blue-800", background: "bg-blue-100" },
  UNAVAILABLE: { label: "Unavailable", text: "text-muted-foreground", background: "bg-muted" },
}

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { label, text, background } = STATUSES[status]

  return <Badge className={cn(text, background)}>{label}</Badge>
}

// The status as text in the badge's colour, for places without a pill
export function PropertyStatusText({ status }: { status: PropertyStatus }) {
  const { label, text } = STATUSES[status]

  return <span className={text}>{label}</span>
}

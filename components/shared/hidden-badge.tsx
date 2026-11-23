import { Badge } from "@/components/ui/badge"

// A dashed outline in muted text, like the hidden card it marks; the Hidden filter pill uses it too
export const HIDDEN_COLORS = "text-muted-foreground border border-dashed border-foreground/25"

// Marks something an admin has hidden
export function HiddenBadge() {
  return (
    <Badge variant="outline" className={HIDDEN_COLORS}>
      Hidden<span className="sr-only"> by an admin</span>
    </Badge>
  )
}

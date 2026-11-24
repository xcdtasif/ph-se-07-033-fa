import { Badge } from "@/components/ui/badge"

// A dashed outline in muted text, like the hidden card it marks; the Hidden filter pill uses it too
export const HIDDEN_COLORS = "text-muted-foreground border border-dashed border-foreground/25"

/*
The pills darken on hover by brightness, which a see-through pill doesn't show, so the Hidden one
gets a faint shade instead, about as dark on the page background
*/
export const HIDDEN_PILL_COLORS = `${HIDDEN_COLORS} hover:bg-foreground/5`

// Marks something an admin has hidden
export function HiddenBadge() {
  return (
    <Badge variant="outline" className={HIDDEN_COLORS}>
      Hidden<span className="sr-only"> by an admin</span>
    </Badge>
  )
}

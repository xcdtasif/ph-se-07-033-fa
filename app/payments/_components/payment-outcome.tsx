import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/*
How a checkout ended, centred in a card: an icon, a heading, any details, and the next step
in a footer like the property page's rent card. mt-2 on top of the 1rem gap is 1.5rem above
the line; below it the button has 1rem on each side, the card's own padding at the bottom.
*/
export function PaymentOutcome({
  icon: Icon,
  iconClassName,
  title,
  children,
  action,
}: {
  icon: LucideIcon
  iconClassName?: string
  title: string
  children?: ReactNode
  action: ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 pt-4 text-center">
        <Icon className={cn("size-10", iconClassName)} aria-hidden="true" />
        <h2 className="text-lg font-semibold">{title}</h2>
        {children}
        <div className="divider-dashed mt-2 flex w-full justify-center pt-4">{action}</div>
      </CardContent>
    </Card>
  )
}

// A short explanation under the heading or the details, ending in a period like empty-state text
export function PaymentNote({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground max-w-sm">{children}</p>
}

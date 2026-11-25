import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// One figure on an overview: its label and icon, what it counts, and the list it opens, if any
export type Stat<Key extends string> = {
  key: Key
  label: string
  icon: LucideIcon
  note: string
  href?: string
}

// A card that opens a page, for the stat cards and the dashboard's section cards
export const CARD_LINK =
  "bg-card focus-visible:ring-ring/50 flex flex-1 rounded-xl border p-4 outline-none hover:brightness-97 focus-visible:ring-3 dark:hover:brightness-115"

// The label and icon on top, the figure, then what it counts
function StatContent({ stat, value }: { stat: Stat<string>; value: ReactNode }) {
  const Icon = stat.icon

  return (
    <>
      <p className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
        {stat.label}
        <Icon className="size-4 shrink-0" aria-hidden="true" />
      </p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-muted-foreground text-xs">{stat.note}</p>
    </>
  )
}

// One card per stat, each with its figure; a stat with a link is a card you can open
export function StatCards<Key extends string>({
  stats,
  values,
}: {
  stats: Stat<Key>[]
  values: Record<Key, ReactNode>
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <li key={stat.key} className="flex">
          {stat.href ? (
            <Link href={stat.href} className={cn(CARD_LINK, "flex-col gap-1")}>
              <StatContent stat={stat} value={values[stat.key]} />
            </Link>
          ) : (
            <div className="bg-card flex flex-1 flex-col gap-1 rounded-xl border p-4">
              <StatContent stat={stat} value={values[stat.key]} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// A list's total from its first page of one
export const totalOf = <T,>(result: { data: T[]; meta?: { total: number } }) =>
  result.meta?.total ?? result.data.length

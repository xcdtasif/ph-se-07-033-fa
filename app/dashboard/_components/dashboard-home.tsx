import type { ReactNode } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { DASHBOARD_SECTIONS } from "@/lib/dashboard"
import type { UserRole } from "@/lib/types"

import { SectionCards } from "./section-cards"

/*
`/dashboard` for every role: the heading, the role's pages as cards, then its figures. The cards
don't read the session, so they're in the prerendered shell with the figures' skeleton
*/
export function DashboardHome({ role, children }: { role: UserRole; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Dashboard" />
      <div className="flex flex-col gap-10">
        <SectionCards sections={DASHBOARD_SECTIONS[role]} />
        {children}
      </div>
    </section>
  )
}

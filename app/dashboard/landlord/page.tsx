import type { Metadata } from "next"
import { Suspense } from "react"

import { DashboardHome } from "../_components/dashboard-home"
import { LandlordOverview, LandlordOverviewSkeleton } from "../_components/landlord-overview"

export const metadata: Metadata = {
  title: "Dashboard",
}

// The landlord's figures under the dashboard's pages; the proxy shows it at /dashboard
export default function LandlordDashboardPage() {
  return (
    <DashboardHome role="LANDLORD">
      <Suspense fallback={<LandlordOverviewSkeleton />}>
        <LandlordOverview />
      </Suspense>
    </DashboardHome>
  )
}

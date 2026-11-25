import type { Metadata } from "next"
import { Suspense } from "react"

import { DashboardHome } from "../_components/dashboard-home"
import { TenantOverview, TenantOverviewSkeleton } from "../_components/tenant-overview"

export const metadata: Metadata = {
  title: "Dashboard",
}

// The tenant's request counts under the dashboard's pages; the proxy shows it at /dashboard
export default function TenantDashboardPage() {
  return (
    <DashboardHome role="TENANT">
      <Suspense fallback={<TenantOverviewSkeleton />}>
        <TenantOverview />
      </Suspense>
    </DashboardHome>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"

import { AdminOverview, AdminOverviewSkeleton } from "../_components/admin-overview"
import { DashboardHome } from "../_components/dashboard-home"

export const metadata: Metadata = {
  title: "Dashboard",
}

// The platform's figures under the dashboard's pages; the proxy shows it at /dashboard
export default function AdminDashboardPage() {
  return (
    <DashboardHome role="ADMIN">
      <Suspense fallback={<AdminOverviewSkeleton />}>
        <AdminOverview />
      </Suspense>
    </DashboardHome>
  )
}

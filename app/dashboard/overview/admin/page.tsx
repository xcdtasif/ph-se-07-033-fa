import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"

import { AdminOverview, AdminOverviewSkeleton } from "../_components/admin-overview"

export const metadata: Metadata = {
  title: "Overview",
}

// The platform's figures; the proxy shows it at /dashboard/overview
export default function AdminOverviewPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Overview" />
      <Suspense fallback={<AdminOverviewSkeleton />}>
        <AdminOverview />
      </Suspense>
    </section>
  )
}

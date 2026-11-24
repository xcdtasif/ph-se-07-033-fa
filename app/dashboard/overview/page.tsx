import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"

import { LandlordOverview, LandlordOverviewSkeleton } from "./_components/landlord-overview"

export const metadata: Metadata = {
  title: "Overview",
}

export default function OverviewPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Overview" />
      <Suspense fallback={<LandlordOverviewSkeleton />}>
        <LandlordOverview />
      </Suspense>
    </section>
  )
}

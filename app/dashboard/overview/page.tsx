import type { Metadata } from "next"
import { Suspense } from "react"

import { LandlordOverview, LandlordOverviewSkeleton } from "./_components/landlord-overview"

export const metadata: Metadata = {
  title: "Overview",
}

export default function OverviewPage() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
      <Suspense fallback={<LandlordOverviewSkeleton />}>
        <LandlordOverview />
      </Suspense>
    </section>
  )
}

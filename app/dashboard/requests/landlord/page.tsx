import type { Metadata } from "next"

import { LandlordRequests, LandlordRequestsSkeleton } from "../_components/landlord-requests"
import { RequestsPage } from "../_components/requests-page"

export const metadata: Metadata = {
  title: "Requests",
}

// The requests for the landlord's properties; the proxy shows it at /dashboard/requests
export default function LandlordRequestsPage({
  searchParams,
}: PageProps<"/dashboard/requests/landlord">) {
  return (
    <RequestsPage
      searchParams={searchParams}
      List={LandlordRequests}
      Skeleton={LandlordRequestsSkeleton}
    />
  )
}

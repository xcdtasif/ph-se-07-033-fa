import type { Metadata } from "next"

import { AdminRequests, AdminRequestsSkeleton } from "../_components/admin-requests"
import { RequestsPage } from "../_components/requests-page"

export const metadata: Metadata = {
  title: "Requests",
}

// Every request on the platform, read-only; the proxy shows it at /dashboard/requests
export default function AdminRequestsPage({
  searchParams,
}: PageProps<"/dashboard/requests/admin">) {
  return (
    <RequestsPage
      searchParams={searchParams}
      List={AdminRequests}
      Skeleton={AdminRequestsSkeleton}
    />
  )
}

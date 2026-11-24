import type { Metadata } from "next"

import { RequestsPage } from "../_components/requests-page"
import { TenantRequests, TenantRequestsSkeleton } from "../_components/tenant-requests"

export const metadata: Metadata = {
  title: "Requests",
}

// The tenant's own requests; the proxy shows it at /dashboard/requests
export default function TenantRequestsPage({
  searchParams,
}: PageProps<"/dashboard/requests/tenant">) {
  return (
    <RequestsPage
      searchParams={searchParams}
      List={TenantRequests}
      Skeleton={TenantRequestsSkeleton}
    />
  )
}

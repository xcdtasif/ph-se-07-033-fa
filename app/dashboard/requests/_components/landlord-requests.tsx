import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { requestStatusLabel } from "@/components/shared/request-status-badge"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref } from "@/lib/dashboard"
import type { LandlordRequest, RequestStatus } from "@/lib/types"

import { LandlordRequestItem } from "./landlord-request-item"
import { RequestCardSkeleton } from "./request-card"

const REQUESTS_PAGE_SIZE = 6

export function LandlordRequestsSkeleton({ showProperty = true }: { showProperty?: boolean }) {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: REQUESTS_PAGE_SIZE }, (_, index) => (
          <RequestCardSkeleton key={index} showProperty={showProperty} />
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  )
}

type LandlordRequestsProps = {
  page: number
  status?: RequestStatus
  // One property's requests, on its page: cards without the property, and that page's links
  property?: { id: string; href: (page: number) => string }
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function LandlordRequests({ page, status, property }: LandlordRequestsProps) {
  const query = new URLSearchParams({ page: String(page), limit: String(REQUESTS_PAGE_SIZE) })

  if (status) {
    query.set("status", status)
  }

  if (property) {
    query.set("propertyId", property.id)
  }

  const result = await authFetch<LandlordRequest[]>(`/api/landlord/requests?${query}`)

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: requests, meta } = result
  const total = meta?.total ?? requests.length
  const totalPages = Math.max(1, Math.ceil(total / REQUESTS_PAGE_SIZE))
  const href = property ? property.href : (target: number) => requestsHref(status, target)

  if (requests.length === 0) {
    // Past the last page, none with this status, or no requests at all
    return (
      <div className="text-muted-foreground empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no requests on this page.</p>
            <Link
              href={href(1)}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : status ? (
          <p>
            {property
              ? `No ${requestStatusLabel(status).toLowerCase()} requests.`
              : `You have no ${requestStatusLabel(status).toLowerCase()} requests.`}
          </p>
        ) : (
          <p>No one has requested {property ? "this property" : "your properties"} yet.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <LandlordRequestItem key={request.id} request={request} showProperty={!property} />
        ))}
      </ul>
      <Pagination
        label="Requests pagination"
        page={page}
        totalPages={totalPages}
        href={href}
        scrollTo="requests"
      />
    </div>
  )
}

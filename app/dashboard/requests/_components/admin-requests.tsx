import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { requestStatusLabel } from "@/components/shared/request-status-badge"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref } from "@/lib/dashboard"
import type { AdminRequest, RequestStatus } from "@/lib/types"

import { RequestCardDetails, RequestCardSkeleton } from "./request-card"

const REQUESTS_PAGE_SIZE = 6

export function AdminRequestsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: REQUESTS_PAGE_SIZE }, (_, index) => (
          <RequestCardSkeleton key={index} showFooter={false} />
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  )
}

/*
Every request on the platform, newest first, as cards like the landlord's without the footer:
admins can't change a request's status. The property's name isn't a link, since a hidden
property's public page doesn't open.
*/
export async function AdminRequests({ page, status }: { page: number; status?: RequestStatus }) {
  const query = new URLSearchParams({ page: String(page), limit: String(REQUESTS_PAGE_SIZE) })

  if (status) {
    query.set("status", status)
  }

  // Per-user, uncached: reads cookies, so it sits inside <Suspense>
  const result = await authFetch<AdminRequest[]>(`/api/admin/requests?${query}`)

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: requests, meta } = result
  const total = meta?.total ?? requests.length
  const totalPages = Math.max(1, Math.ceil(total / REQUESTS_PAGE_SIZE))

  if (requests.length === 0) {
    // Past the last page, none with this status, or no requests at all
    return (
      <div className="empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no requests on this page.</p>
            <Link
              href={requestsHref(status)}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : status ? (
          <p>No {requestStatusLabel(status).toLowerCase()} requests.</p>
        ) : (
          <p>No requests.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <li key={request.id} className="bg-card flex flex-col rounded-xl border p-4">
            <RequestCardDetails request={request} status={request.status} />
          </li>
        ))}
      </ul>
      <Pagination
        label="Requests pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => requestsHref(status, target)}
        scrollTo="requests"
      />
    </div>
  )
}

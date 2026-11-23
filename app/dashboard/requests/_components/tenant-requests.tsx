import { MapPin } from "lucide-react"
import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { Pagination } from "@/components/shared/pagination"
import { PropertyImage } from "@/components/shared/property-image"
import { Rating } from "@/components/shared/rating"
import { RequestStatusBadge, requestStatusLabel } from "@/components/shared/request-status-badge"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { formatDate, formatMoney } from "@/lib/format"
import type { RentalRequest, RequestStatus } from "@/lib/types"

import { CancelRequestDialog } from "./cancel-request-dialog"
import { PayDepositButton } from "./pay-deposit-button"
import { ReviewDialog } from "./review-dialog"

const REQUESTS_PAGE_SIZE = 6

// This page's URL for a status filter and page, leaving defaults out of the query
export const requestsHref = (status?: RequestStatus, page = 1) => {
  const query = new URLSearchParams()

  if (status) {
    query.set("status", status)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const search = query.toString()

  return search ? `/dashboard/requests?${search}` : "/dashboard/requests"
}

// The backend allows cancelling only these
const CANCELLABLE: RequestStatus[] = ["PENDING", "APPROVED"]

/*
A card: thumbnail with the status on its right, title, location, prices, date and rating,
then the actions centred in a footer. Three cards per row on desktop, two on
tablets, one on phones.
*/
function RequestItem({ request }: { request: RentalRequest }) {
  const { property, status } = request

  return (
    <li className="bg-card flex flex-col rounded-xl border p-4">
      {/* Grows, so the footers line up across a row */}
      <div className="flex flex-1 flex-col gap-2">
        {/* Same size as the property page's gallery thumbnails */}
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="bg-muted relative aspect-3/2 w-24 overflow-hidden rounded-lg sm:w-32">
            <PropertyImage
              src={property.images[0]}
              alt=""
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <RequestStatusBadge status={status} />
        </div>
        <Link
          href={`/properties/${property.id}`}
          className="link-hover-underline line-clamp-2 font-medium"
        >
          {property.name}
        </Link>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{property.location}</span>
        </p>
        {/* On a narrow screen it wraps between the two prices, never inside one */}
        <p className="flex flex-wrap gap-x-2 text-sm">
          <span className="whitespace-nowrap">
            {formatMoney(property.rent)}
            <span className="text-muted-foreground"> / month</span>
          </span>
          <span className="whitespace-nowrap">
            {formatMoney(property.deposit)}
            <span className="text-muted-foreground"> deposit</span>
          </span>
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            Requested on {formatDate(request.createdAt)}
          </p>
          <Rating averageRating={property.averageRating} reviewCount={property.reviewCount} />
        </div>
      </div>
      {/*
      Same spacing as the rent card's note: 1.5rem above the line, 1rem below,
      matching the card's bottom padding. A note is as tall as the button.
      */}
      <div className="divider-dashed mt-6 flex justify-center gap-2 pt-4">
        {CANCELLABLE.includes(status) ? (
          <>
            <CancelRequestDialog requestId={request.id} status={status} />
            {status === "APPROVED" && <PayDepositButton requestId={request.id} />}
          </>
        ) : status === "COMPLETED" && !request.isReviewed ? (
          <ReviewDialog requestId={request.id} propertyName={property.name} />
        ) : (
          <p className="text-muted-foreground flex h-7 items-center text-sm">
            This request is {status.toLowerCase()}
          </p>
        )}
      </div>
    </li>
  )
}

// A card while it loads: the same frame, thumbnail, rows and footer as RequestItem
function RequestItemSkeleton() {
  return (
    <div className="bg-card flex flex-col rounded-xl border p-4">
      <div className="flex flex-1 flex-col gap-2">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="skeleton aspect-3/2 w-24 rounded-lg sm:w-32" />
          <div className="skeleton h-5 w-16 rounded-4xl" />
        </div>
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2 text-sm" />
        <SkeletonText className="w-2/3 text-sm" />
        <div className="flex items-center justify-between gap-2">
          <SkeletonText className="w-32 text-xs" />
          <div className="skeleton h-5 w-14 rounded-4xl" />
        </div>
      </div>
      <div className="divider-dashed mt-6 flex justify-center gap-2 pt-4">
        <div className="skeleton h-7 w-28 rounded-lg" />
      </div>
    </div>
  )
}

export function TenantRequestsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: REQUESTS_PAGE_SIZE }, (_, index) => (
        <RequestItemSkeleton key={index} />
      ))}
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function TenantRequests({ page, status }: { page: number; status?: RequestStatus }) {
  const statusQuery = status ? `&status=${status}` : ""
  const result = await authFetch<RentalRequest[]>(
    `/api/tenant/requests?page=${page}&limit=${REQUESTS_PAGE_SIZE}${statusQuery}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: requests, meta } = result
  const total = meta?.total ?? requests.length
  const totalPages = Math.max(1, Math.ceil(total / REQUESTS_PAGE_SIZE))

  if (requests.length === 0) {
    // Past the last page, none with this status, or no requests at all
    return (
      <div className="text-muted-foreground empty-state flex flex-col items-center gap-4">
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
          <p>You have no {requestStatusLabel(status).toLowerCase()} requests.</p>
        ) : (
          <>
            <p>You haven&apos;t sent any rental requests yet.</p>
            <Link
              href="/properties"
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Browse properties
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <RequestItem key={request.id} request={request} />
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

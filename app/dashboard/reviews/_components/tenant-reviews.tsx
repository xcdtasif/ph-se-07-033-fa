import Link from "next/link"

import { requestsHref } from "@/app/dashboard/requests/_components/tenant-requests"
import { ApiError } from "@/components/shared/api-error"
import { Pagination } from "@/components/shared/pagination"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Stars } from "@/components/shared/stars"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { formatShortDate } from "@/lib/format"
import type { TenantReview } from "@/lib/types"
import { cn } from "@/lib/utils"

const REVIEWS_PAGE_SIZE = 6

// This page's URL for a page, leaving the first page out of the query
const reviewsHref = (page = 1) =>
  page > 1 ? `/dashboard/reviews?page=${page}` : "/dashboard/reviews"

/*
A card like the property page's reviews, with the property in place of the tenant's name. A
review an admin has hidden sits on the page background with a dashed border, like an empty
list's box.
*/
function ReviewItem({ review }: { review: TenantReview }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4",
        review.isHidden ? "border-foreground/25 border-dashed" : "bg-card",
      )}
    >
      {review.isHidden && <span className="sr-only">Hidden by an admin</span>}
      <Link
        href={`/properties/${review.property.id}`}
        className="link-hover-underline line-clamp-2 font-medium"
      >
        {review.property.name}
      </Link>
      <div className="flex items-center gap-2 text-xs">
        <Stars rating={review.rating} />
        <span className="text-muted-foreground">{formatShortDate(review.createdAt)}</span>
      </div>
      <p className="text-sm whitespace-pre-line">{review.comment}</p>
    </li>
  )
}

// A comment's length isn't known, so each card assumes two lines
export function TenantReviewsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: REVIEWS_PAGE_SIZE }, (_, index) => (
        <div key={index} className="bg-card flex flex-col gap-2 rounded-xl border p-4">
          <SkeletonText className="w-3/4" />
          <SkeletonText className="w-36 text-xs" />
          <div className="text-sm">
            <SkeletonText />
            <SkeletonText className="w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function TenantReviews({ page }: { page: number }) {
  const result = await authFetch<TenantReview[]>(
    `/api/tenant/reviews?page=${page}&limit=${REVIEWS_PAGE_SIZE}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: reviews, meta } = result
  const total = meta?.total ?? reviews.length
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE))

  if (reviews.length === 0) {
    // Past the last page, or no reviews at all
    return (
      <div className="text-muted-foreground empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no reviews on this page.</p>
            <Link
              href={reviewsHref()}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : (
          <>
            <p>You haven&apos;t reviewed any properties yet.</p>
            <Link
              href={requestsHref("COMPLETED")}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              View completed requests
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </ul>
      <Pagination
        label="Reviews pagination"
        page={page}
        totalPages={totalPages}
        href={reviewsHref}
        scrollTo="reviews"
      />
    </div>
  )
}

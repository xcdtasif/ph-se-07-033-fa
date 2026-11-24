import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { HiddenBadge } from "@/components/shared/hidden-badge"
import { MessageText, MessageTextSkeleton } from "@/components/shared/message-text"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Stars, StarsSkeleton } from "@/components/shared/stars"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref, reviewsHref } from "@/lib/dashboard"
import { formatDate } from "@/lib/format"
import type { TenantReview } from "@/lib/types"
import { cn } from "@/lib/utils"

const REVIEWS_PAGE_SIZE = 6

/*
A card like the property page's reviews: the rating line first, then the property in place of
the tenant's name. A review an admin has hidden sits on the page background with a dashed
border, like an empty list's box, with a Hidden badge at the end of its rating line.
*/
function ReviewItem({ review }: { review: TenantReview }) {
  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-4",
        review.isHidden ? "border-foreground/25 border-dashed" : "bg-card",
      )}
    >
      <div className="flex items-center gap-2 text-xs">
        <Stars rating={review.rating} />
        {review.isHidden && (
          <span className="ml-auto">
            <HiddenBadge />
          </span>
        )}
      </div>
      <Link
        href={`/properties/${review.property.id}`}
        className="link-hover-underline line-clamp-2 font-medium"
      >
        {review.property.name}
      </Link>
      <MessageText>{review.comment}</MessageText>
      <p className="text-muted-foreground text-xs">Reviewed on {formatDate(review.createdAt)}</p>
    </li>
  )
}

// A comment's length isn't known, so each card assumes two lines
export function TenantReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: REVIEWS_PAGE_SIZE }, (_, index) => (
          <div key={index} className="bg-card flex flex-col gap-2 rounded-xl border p-4">
            <StarsSkeleton className="text-xs" />
            <SkeletonText className="w-3/4" />
            <MessageTextSkeleton />
            <SkeletonText className="w-32 text-xs" />
          </div>
        ))}
      </div>
      <PaginationSkeleton />
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

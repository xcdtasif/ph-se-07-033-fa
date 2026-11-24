import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref, reviewsHref } from "@/lib/dashboard"
import type { TenantReview } from "@/lib/types"

import { ReviewCard, ReviewCardSkeleton } from "./review-card"

const REVIEWS_PAGE_SIZE = 6

// A comment's length isn't known, so each card assumes two lines
export function TenantReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: REVIEWS_PAGE_SIZE }, (_, index) => (
          <ReviewCardSkeleton key={index} />
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
          <ReviewCard key={review.id} review={review} />
        ))}
      </ul>
      <Pagination
        label="Reviews pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => reviewsHref({ page: target })}
        scrollTo="reviews"
      />
    </div>
  )
}

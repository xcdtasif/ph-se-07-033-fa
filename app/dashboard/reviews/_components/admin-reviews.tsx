import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { HideButton } from "@/components/shared/hide-button"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import {
  reviewFilterLabel,
  reviewFilterQuery,
  type ReviewFilter,
} from "@/components/shared/review-filter"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { reviewsHref } from "@/lib/dashboard"
import type { AdminReview } from "@/lib/types"

import { setReviewHiddenAction } from "../_actions/review-actions"
import { ReviewCard, ReviewCardSkeleton } from "./review-card"

const REVIEWS_PAGE_SIZE = 6

export function AdminReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: REVIEWS_PAGE_SIZE }, (_, index) => (
          <ReviewCardSkeleton key={index} admin />
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  )
}

type AdminReviewsProps = {
  page: number
  filter?: ReviewFilter
}

/*
Per-user, uncached: reads cookies, so it sits inside <Suspense>. Every review on the platform,
hidden ones too: the tenant's cards with who wrote it and Hide or Unhide in a footer.
*/
export async function AdminReviews({ page, filter }: AdminReviewsProps) {
  const result = await authFetch<AdminReview[]>(
    `/api/admin/reviews?page=${page}&limit=${REVIEWS_PAGE_SIZE}${reviewFilterQuery(filter)}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: reviews, meta } = result
  const total = meta?.total ?? reviews.length
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE))

  if (reviews.length === 0) {
    // Past the last page, or none with this filter
    return (
      <div className="empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no reviews on this page.</p>
            <Link
              href={reviewsHref({ filter })}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : (
          <p>No {filter ? `${reviewFilterLabel(filter).toLowerCase()} ` : ""}reviews.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            tenant={review.tenant}
            footer={
              <HideButton
                isHidden={review.isHidden}
                action={setReviewHiddenAction.bind(null, review.id, review.propertyId)}
                noun="review"
                description="It leaves the property's reviews and rating until it's unhidden."
              />
            }
          />
        ))}
      </ul>
      <Pagination
        label="Reviews pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => reviewsHref({ filter, page: target })}
        scrollTo="reviews"
      />
    </div>
  )
}

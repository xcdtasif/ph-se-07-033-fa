import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Stars } from "@/components/shared/stars"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { formatShortDate } from "@/lib/format"
import type { LandlordReview } from "@/lib/types"

const REVIEWS_PAGE_SIZE = 6

// A comment's length isn't known, so each card assumes two lines
export function OwnPropertyReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: REVIEWS_PAGE_SIZE }, (_, index) => (
          <div key={index} className="bg-card flex flex-col gap-2 rounded-xl border p-4">
            <SkeletonText className="w-1/3" />
            <SkeletonText className="w-36 text-xs" />
            <div className="text-sm">
              <SkeletonText />
              <SkeletonText className="w-2/3" />
            </div>
          </div>
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  )
}

type OwnPropertyReviewsProps = {
  propertyId: string
  page: number
  // The URL of a reviews page, keeping the requests' page
  href: (page: number) => string
}

/*
Per-user, uncached: reads cookies, so it sits inside <Suspense>. Cards like the public property
page's: the tenant, the rating line, the comment. Reviews an admin has hidden are left out.
*/
export async function OwnPropertyReviews({ propertyId, page, href }: OwnPropertyReviewsProps) {
  const result = await authFetch<LandlordReview[]>(
    `/api/landlord/reviews?page=${page}&limit=${REVIEWS_PAGE_SIZE}&propertyId=${encodeURIComponent(propertyId)}`,
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
              href={href(1)}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : (
          <p>No one has reviewed this property yet.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <li key={review.id} className="bg-card flex flex-col gap-2 rounded-xl border p-4">
            <p className="font-medium">{review.tenant.name}</p>
            <div className="flex items-center gap-2 text-xs">
              <Stars rating={review.rating} />
              <span className="text-muted-foreground">{formatShortDate(review.createdAt)}</span>
            </div>
            <p className="text-sm whitespace-pre-line">{review.comment}</p>
          </li>
        ))}
      </ul>
      <Pagination
        label="Reviews pagination"
        page={page}
        totalPages={totalPages}
        href={href}
        scrollTo="reviews"
      />
    </div>
  )
}

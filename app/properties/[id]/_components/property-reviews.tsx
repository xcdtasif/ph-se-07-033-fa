import { ApiError } from "@/components/shared/api-error"
import { MessageText, MessageTextSkeleton } from "@/components/shared/message-text"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Stars, StarsSkeleton } from "@/components/shared/stars"
import { formatDate } from "@/lib/format"
import { getPropertyReviews } from "@/lib/properties"

const REVIEWS_PAGE_SIZE = 6

export async function PropertyReviews({ propertyId, page }: { propertyId: string; page: number }) {
  const result = await getPropertyReviews(propertyId, page, REVIEWS_PAGE_SIZE)

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: reviews, meta } = result
  const total = meta?.total ?? reviews.length
  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PAGE_SIZE))

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground empty-state">
        {total > 0 ? "There are no reviews on this page." : "No reviews yet."}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* A card per review, two per row on desktop */}
      <ul className="grid gap-4 lg:grid-cols-2">
        {reviews.map((review) => (
          <li key={review.id} className="bg-card flex flex-col gap-2 rounded-xl border p-4">
            <p className="font-medium">{review.tenant.name}</p>
            <div className="flex items-center gap-2 text-xs">
              <Stars rating={review.rating} />
            </div>
            <MessageText>{review.comment}</MessageText>
            <p className="text-muted-foreground text-xs">
              Reviewed on {formatDate(review.createdAt)}
            </p>
          </li>
        ))}
      </ul>
      <Pagination
        label="Reviews pagination"
        page={page}
        totalPages={totalPages}
        href={(target) =>
          target === 1
            ? `/properties/${propertyId}`
            : `/properties/${propertyId}?reviewsPage=${target}`
        }
        scrollTo="reviews"
      />
    </div>
  )
}

/*
The reviews while they load. `count` is how many to expect (the property's review count,
up to a page): none shows the empty box, so the section is as tall as what replaces it.
A comment's length isn't known, so each card assumes two lines.
*/
export function PropertyReviewsSkeleton({ count }: { count: number }) {
  if (count === 0) {
    return (
      <div className="empty-state" aria-hidden="true">
        <SkeletonText className="mx-auto w-28" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: Math.min(count, REVIEWS_PAGE_SIZE) }, (_, index) => (
          <div key={index} className="bg-card flex flex-col gap-2 rounded-xl border p-4">
            <SkeletonText className="w-32" />
            <StarsSkeleton className="text-xs" />
            <MessageTextSkeleton />
            <SkeletonText className="w-32 text-xs" />
          </div>
        ))}
      </div>
      <PaginationSkeleton />
    </div>
  )
}

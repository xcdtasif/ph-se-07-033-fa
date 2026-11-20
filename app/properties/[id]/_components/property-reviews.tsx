import { Star } from "lucide-react"

import { ApiError } from "@/components/shared/api-error"
import { Pagination } from "@/components/shared/pagination"
import { formatDate } from "@/lib/format"
import { getPropertyReviews } from "@/lib/properties"
import { cn } from "@/lib/utils"

export const REVIEWS_PAGE_SIZE = 5

// `?reviewsPage=` as a whole page number, 1 for anything else
export const parseReviewsPage = (value: string | string[] | undefined) => {
  const page = Number(value)

  return Number.isInteger(page) && page > 1 ? page : 1
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-sm">
      <span className="sr-only">Rated {rating} out of 5</span>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden="true"
          className={cn(
            "size-[1em]",
            index < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
          )}
        />
      ))}
    </span>
  )
}

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
      <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center">
        {total > 0 ? "There are no reviews on this page." : "No reviews yet."}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col divide-y rounded-xl border">
        {reviews.map((review) => (
          <li key={review.id} className="flex flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{review.tenant.name}</p>
              <p className="text-muted-foreground text-sm">{formatDate(review.createdAt)}</p>
            </div>
            <Stars rating={review.rating} />
            <p className="text-sm whitespace-pre-line">{review.comment}</p>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          label="Reviews pagination"
          page={page}
          totalPages={totalPages}
          href={(target) =>
            target === 1
              ? `/properties/${propertyId}`
              : `/properties/${propertyId}?reviewsPage=${target}`
          }
        />
      )}
    </div>
  )
}

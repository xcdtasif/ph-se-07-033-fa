import { Star } from "lucide-react"

import { ApiError } from "@/components/shared/api-error"
import { Pagination } from "@/components/shared/pagination"
import { formatShortDate } from "@/lib/format"
import { getPropertyReviews } from "@/lib/properties"
import { cn } from "@/lib/utils"

export const REVIEWS_PAGE_SIZE = 6

// Each star as tall as the text around it (1em)
function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
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
      {/* A card per review, two per row on desktop */}
      <ul className="grid gap-4 lg:grid-cols-2">
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

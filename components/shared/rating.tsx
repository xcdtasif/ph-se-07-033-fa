import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

type RatingProps = {
  averageRating: number | null
  reviewCount: number
  className?: string
}

// A star with the average and review count, or "N/A" before the first review
export function Rating({ averageRating, reviewCount, className }: RatingProps) {
  return (
    <span className={cn("flex items-center gap-1", className)}>
      <Star className="size-[1em] shrink-0 fill-amber-400 text-amber-400" aria-hidden="true" />
      {averageRating === null ? (
        <>
          <span aria-hidden="true">N/A</span>
          <span className="sr-only">No reviews yet</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">
            {averageRating.toFixed(1)}{" "}
            <span className="text-muted-foreground">({reviewCount})</span>
          </span>
          <span className="sr-only">
            Rated {averageRating.toFixed(1)} out of 5 from {reviewCount}{" "}
            {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </>
      )}
    </span>
  )
}

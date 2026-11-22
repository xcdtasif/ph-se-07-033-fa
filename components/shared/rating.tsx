import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

type RatingProps = {
  averageRating: number | null
  reviewCount: number
  className?: string
}

/*
A pill with a star, the average and review count, or "N/A" before the first review.
Same height and text size as the status badge on the property card.
*/
export function Rating({ averageRating, reviewCount, className }: RatingProps) {
  return (
    <span
      className={cn(
        "bg-muted flex h-5 w-fit shrink-0 items-center gap-1 rounded-4xl px-2 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
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

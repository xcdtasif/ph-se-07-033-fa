import { Star } from "lucide-react"

import { cn } from "@/lib/utils"

// A 1 to 5 rating as five stars, each as tall as the text around it (1em)
export function Stars({ rating }: { rating: number }) {
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

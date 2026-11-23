"use client"

import { Star } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"

type RatingInputProps = {
  name: string
  defaultValue?: number
  invalid?: boolean
}

/*
Five stars over hidden radio buttons, so the form posts the rating and the keyboard works like
any radio group (Tab in, arrows to change). Hovering lights the stars up to the one under the
pointer; otherwise they show the chosen rating. On an error the empty stars are outlined in red,
like an invalid field.
*/
export function RatingInput({ name, defaultValue = 0, invalid }: RatingInputProps) {
  const [value, setValue] = useState(defaultValue)
  const [hovered, setHovered] = useState(0)
  const shown = hovered || value

  return (
    <div
      className="has-focus-visible:ring-ring/50 flex w-fit rounded-lg has-focus-visible:ring-3"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <label key={star} className="cursor-pointer p-0.5" onMouseEnter={() => setHovered(star)}>
          <input
            type="radio"
            name={name}
            value={star}
            checked={value === star}
            onChange={() => setValue(star)}
            aria-invalid={invalid}
            className="sr-only"
          />
          <Star
            aria-hidden="true"
            className={cn(
              "size-6 transition-colors",
              star <= shown
                ? "fill-amber-400 text-amber-400"
                : invalid
                  ? "text-destructive"
                  : "text-muted-foreground/40",
            )}
          />
          <span className="sr-only">{star === 1 ? "1 star" : `${star} stars`}</span>
        </label>
      ))}
    </div>
  )
}

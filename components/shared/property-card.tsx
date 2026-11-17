import { ImageOff, MapPin, Star } from "lucide-react"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import type { Property } from "@/lib/types"

type PropertyCardProps = {
  property: Property
  // Load the image right away, for cards visible without scrolling
  eager?: boolean
}

export function PropertyCard({ property, eager = false }: PropertyCardProps) {
  const { name, location, images, rent, category, reviewCount, averageRating } = property
  const image = images[0]

  return (
    <Card className="w-full gap-0 py-0">
      <div className="bg-muted relative aspect-3/2">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
        ) : (
          <ImageOff
            className="text-muted-foreground absolute inset-0 m-auto size-8"
            aria-label="No photo"
          />
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {category.name}
        </p>
        <h3 className="line-clamp-1 font-semibold">{name}</h3>
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{location}</span>
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <p>
            <span className="font-semibold">{formatMoney(rent)}</span>
            <span className="text-muted-foreground text-sm"> / month</span>
          </p>
          {averageRating === null ? (
            <span className="text-muted-foreground text-sm">No reviews</span>
          ) : (
            <p className="text-sm">
              <span className="flex items-center gap-1" aria-hidden="true">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {averageRating.toFixed(1)}
                <span className="text-muted-foreground">({reviewCount})</span>
              </span>
              <span className="sr-only">
                Rated {averageRating.toFixed(1)} out of 5 from {reviewCount}{" "}
                {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

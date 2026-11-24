import { MapPin } from "lucide-react"
import Link from "next/link"

import { PropertyImage } from "@/components/shared/property-image"
import { PropertyStatusBadge } from "@/components/shared/property-status-badge"
import { Rating } from "@/components/shared/rating"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Card, CardContent } from "@/components/ui/card"
import { formatMoney } from "@/lib/format"
import type { Property } from "@/lib/types"

type PropertyCardProps = {
  property: Property
  // Load the image right away, for cards visible without scrolling
  eager?: boolean
}

export function PropertyCard({ property, eager = false }: PropertyCardProps) {
  const { id, name, location, images, rent, status, category, reviewCount, averageRating } =
    property

  // The whole card is the link; its text (name first) is what screen readers announce
  return (
    <Link
      href={`/properties/${id}`}
      className="focus-visible:ring-ring/50 flex w-full rounded-xl outline-none focus-visible:ring-3"
    >
      <Card className="w-full gap-0 py-0 transition-shadow hover:shadow-md">
        <div className="bg-muted relative aspect-3/2">
          <PropertyImage
            src={images[0]}
            alt={name}
            fill
            sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
        </div>
        <CardContent className="flex flex-1 flex-col gap-2 p-4">
          {/* Category with the status on the right, like the price and rating below */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground line-clamp-1 text-xs font-medium tracking-wide uppercase">
              {category.name}
            </p>
            <PropertyStatusBadge status={status} />
          </div>
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
            <Rating averageRating={averageRating} reviewCount={reviewCount} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// The card while it loads: the same frame, photo box and rows, so it's as tall at every width
export function PropertyCardSkeleton() {
  return (
    <Card className="w-full gap-0 py-0">
      <div className="skeleton aspect-3/2" />
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <SkeletonText className="w-24 text-xs" />
          <div className="skeleton h-5 w-16 rounded-4xl" />
        </div>
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2 text-sm" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <SkeletonText className="w-32" />
          <div className="skeleton h-5 w-14 rounded-4xl" />
        </div>
      </CardContent>
    </Card>
  )
}

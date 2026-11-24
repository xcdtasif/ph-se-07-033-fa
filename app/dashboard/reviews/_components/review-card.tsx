import Link from "next/link"
import type { ReactNode } from "react"

import { HiddenBadge } from "@/components/shared/hidden-badge"
import { MessageText, MessageTextSkeleton } from "@/components/shared/message-text"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Stars, StarsSkeleton } from "@/components/shared/stars"
import { formatDate } from "@/lib/format"
import type { AdminReview, TenantReview } from "@/lib/types"
import { cn } from "@/lib/utils"

type ReviewCardProps = {
  review: TenantReview
  // The admin's: who wrote it, under the property
  tenant?: AdminReview["tenant"]
  // The admin's: actions in a footer
  footer?: ReactNode
}

/*
A card like the property page's reviews: the rating line first, then the property in place of
the tenant's name. A review an admin has hidden sits on the page background with a dashed
border, like an empty list's box, with a Hidden badge at the end of its rating line and its text
muted; the footer's button stays as it is.
*/
export function ReviewCard({ review, tenant, footer }: ReviewCardProps) {
  return (
    <li
      className={cn(
        "flex flex-col rounded-xl border p-4",
        review.isHidden ? "border-foreground/25 border-dashed" : "bg-card",
      )}
    >
      {/* Grows, so the footers line up across a row */}
      <div className={cn("flex flex-1 flex-col gap-2", review.isHidden && "text-muted-foreground")}>
        {/* As tall as the Hidden badge on every card, so the rows below line up */}
        <div className="flex h-5 items-center gap-2 text-xs">
          <Stars rating={review.rating} />
          {review.isHidden && (
            <span className="ml-auto">
              <HiddenBadge />
            </span>
          )}
        </div>
        <Link
          href={`/properties/${review.property.id}`}
          className="link-hover-underline line-clamp-2 font-medium"
        >
          {review.property.name}
        </Link>
        {tenant && (
          <p
            className="line-clamp-1 text-sm font-medium"
            title={`${tenant.name} (${tenant.email})`}
          >
            {tenant.name}
          </p>
        )}
        <MessageText>{review.comment}</MessageText>
        <p className="text-muted-foreground text-xs">Reviewed on {formatDate(review.createdAt)}</p>
      </div>
      {/* Like a request card's actions: 1.5rem above the line, 1rem below */}
      {footer && <div className="divider-dashed mt-6 flex justify-center gap-2 pt-4">{footer}</div>}
    </li>
  )
}

// A card while it loads; a comment's length isn't known, so it assumes two lines
export function ReviewCardSkeleton({ admin = false }: { admin?: boolean }) {
  return (
    <div className="bg-card flex flex-col rounded-xl border p-4">
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex h-5 items-center text-xs">
          <StarsSkeleton />
        </div>
        <SkeletonText className="w-3/4" />
        {admin && <SkeletonText className="w-1/3 text-sm" />}
        <MessageTextSkeleton />
        <SkeletonText className="w-32 text-xs" />
      </div>
      {admin && (
        <div className="divider-dashed mt-6 flex justify-center pt-4">
          <div className="skeleton h-7 w-14 rounded-lg" />
        </div>
      )}
    </div>
  )
}

import { MapPin } from "lucide-react"
import Link from "next/link"

import { MessageText, MessageTextSkeleton } from "@/components/shared/message-text"
import { PropertyImage } from "@/components/shared/property-image"
import { RequestStatusBadge } from "@/components/shared/request-status-badge"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { formatDate } from "@/lib/format"
import type { AdminRequest, RequestStatus } from "@/lib/types"

type RequestCardDetailsProps = {
  request: AdminRequest
  // The status to show, e.g. a change the backend is still saving
  status: RequestStatus
  // Where the property's name links; plain text without one
  propertyHref?: string
  // Off on the property's own page, where the card has only the tenant's name above the message
  showProperty?: boolean
}

/*
The top of a request card as the landlord and the admin see it: thumbnail with the status on its
right, the property, its location, the tenant's name and their message, then the date. Grows, so
the footers line up across a row.
*/
export function RequestCardDetails({
  request,
  status,
  propertyHref,
  showProperty = true,
}: RequestCardDetailsProps) {
  const { property, tenant } = request

  return (
    <div className="flex flex-1 flex-col gap-2">
      {showProperty ? (
        <>
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="bg-muted relative aspect-3/2 w-24 overflow-hidden rounded-lg sm:w-32">
              <PropertyImage
                src={property.images[0]}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
            <RequestStatusBadge status={status} />
          </div>
          {propertyHref ? (
            <Link href={propertyHref} className="link-hover-underline line-clamp-2 font-medium">
              {property.name}
            </Link>
          ) : (
            <p className="line-clamp-2 font-medium">{property.name}</p>
          )}
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            <span className="line-clamp-1">{property.location}</span>
          </p>
          <p className="line-clamp-1 text-sm font-medium">{tenant.name}</p>
        </>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 font-medium">{tenant.name}</p>
          <RequestStatusBadge status={status} />
        </div>
      )}
      <MessageText>{request.message}</MessageText>
      <p className="text-muted-foreground text-xs">Requested on {formatDate(request.createdAt)}</p>
    </div>
  )
}

type RequestCardSkeletonProps = {
  showProperty?: boolean
  // The landlord's cards end in a footer of actions; the admin's don't
  showFooter?: boolean
}

// A card while it loads: the same frame and rows as a card with RequestCardDetails
export function RequestCardSkeleton({
  showProperty = true,
  showFooter = true,
}: RequestCardSkeletonProps) {
  return (
    <div className="bg-card flex flex-col rounded-xl border p-4">
      <div className="flex flex-1 flex-col gap-2">
        {showProperty ? (
          <>
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="skeleton aspect-3/2 w-24 rounded-lg sm:w-32" />
              <div className="skeleton h-5 w-16 rounded-4xl" />
            </div>
            <SkeletonText className="w-3/4" />
            <SkeletonText className="w-1/2 text-sm" />
            <SkeletonText className="w-1/3 text-sm" />
          </>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <SkeletonText className="w-1/3" />
            <div className="skeleton h-5 w-16 rounded-4xl" />
          </div>
        )}
        <MessageTextSkeleton />
        <SkeletonText className="w-32 text-xs" />
      </div>
      {showFooter && (
        <div className="divider-dashed mt-6 flex justify-center gap-2 pt-4">
          <div className="skeleton h-7 w-28 rounded-lg" />
          <div className="skeleton h-7 w-32 rounded-lg" />
        </div>
      )}
    </div>
  )
}

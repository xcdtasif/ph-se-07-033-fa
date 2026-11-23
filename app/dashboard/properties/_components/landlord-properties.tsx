import { MapPin } from "lucide-react"
import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { HiddenBadge } from "@/components/shared/hidden-badge"
import { Pagination } from "@/components/shared/pagination"
import { PropertyImage } from "@/components/shared/property-image"
import { PropertyStatusBadge } from "@/components/shared/property-status-badge"
import {
  propertyFilterLabel,
  propertyFilterQuery,
  type PropertyFilter,
} from "@/components/shared/property-status-filter"
import { Rating } from "@/components/shared/rating"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { buttonVariants } from "@/components/ui/button"
import { authFetch } from "@/lib/auth-fetch"
import { formatDate, formatMoney } from "@/lib/format"
import type { Property } from "@/lib/types"
import { cn } from "@/lib/utils"

import { AvailabilityButton } from "./availability-button"

const PROPERTIES_PAGE_SIZE = 6

// This page's URL for a filter and page, leaving defaults out of the query
export const propertiesHref = (filter?: PropertyFilter, page = 1) => {
  const query = new URLSearchParams()

  if (filter) {
    query.set("status", filter)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const search = query.toString()

  return search ? `/dashboard/properties?${search}` : "/dashboard/properties"
}

/*
A card like a request card: thumbnail with the status on its right, title, location, prices,
rating and date, then the actions centred in a footer. A property an admin has hidden sits on
the page background with a dashed border, like an empty list's box, with a Hidden badge in place
of its status; its title isn't a link since its page is gone for everyone else.
*/
function PropertyItem({ property }: { property: Property }) {
  const { id, name, status, isHidden } = property

  return (
    <li
      className={cn(
        "flex flex-col rounded-xl border p-4",
        isHidden ? "border-foreground/25 border-dashed" : "bg-card",
      )}
    >
      {/* Grows, so the footers line up across a row */}
      <div className="flex flex-1 flex-col gap-2">
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
          {/* Hidden outranks the status while it lasts; the footer still follows the status */}
          {isHidden ? <HiddenBadge /> : <PropertyStatusBadge status={status} />}
        </div>
        {isHidden ? (
          <p className="line-clamp-2 font-medium">{name}</p>
        ) : (
          <Link
            href={`/properties/${id}`}
            className="link-hover-underline line-clamp-2 font-medium"
          >
            {name}
          </Link>
        )}
        <p className="text-muted-foreground flex items-center gap-1 text-sm">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{property.location}</span>
        </p>
        {/* On a narrow screen it wraps between the two prices, never inside one */}
        <p className="flex flex-wrap gap-x-2 text-sm">
          <span className="whitespace-nowrap">
            {formatMoney(property.rent)}
            <span className="text-muted-foreground"> / month</span>
          </span>
          <span className="whitespace-nowrap">
            {formatMoney(property.deposit)}
            <span className="text-muted-foreground"> deposit</span>
          </span>
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            Listed on {formatDate(property.createdAt)}
          </p>
          <Rating averageRating={property.averageRating} reviewCount={property.reviewCount} />
        </div>
      </div>
      {/*
      Spaced like the request cards' footer; a note is as tall as the buttons. A reserved property
      can't be edited, and only an available or unavailable one can change status.
      */}
      <div className="divider-dashed mt-6 flex flex-wrap justify-center gap-2 pt-4">
        {status === "RESERVED" ? (
          <p className="text-muted-foreground flex h-7 items-center text-sm">
            This property is reserved
          </p>
        ) : (
          <>
            <Link
              href={`/dashboard/properties/${id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Edit
            </Link>
            {status !== "RENTED" && <AvailabilityButton propertyId={id} status={status} />}
          </>
        )}
      </div>
    </li>
  )
}

// A card while it loads: the same frame, thumbnail, rows and footer as PropertyItem
function PropertyItemSkeleton() {
  return (
    <div className="bg-card flex flex-col rounded-xl border p-4">
      <div className="flex flex-1 flex-col gap-2">
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="skeleton aspect-3/2 w-24 rounded-lg sm:w-32" />
          <div className="skeleton h-5 w-16 rounded-4xl" />
        </div>
        <SkeletonText className="w-3/4" />
        <SkeletonText className="w-1/2 text-sm" />
        <SkeletonText className="w-2/3 text-sm" />
        <div className="flex items-center justify-between gap-2">
          <SkeletonText className="w-32 text-xs" />
          <div className="skeleton h-5 w-14 rounded-4xl" />
        </div>
      </div>
      <div className="divider-dashed mt-6 flex justify-center gap-2 pt-4">
        <div className="skeleton h-7 w-12 rounded-lg" />
        <div className="skeleton h-7 w-32 rounded-lg" />
      </div>
    </div>
  )
}

export function LandlordPropertiesSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: PROPERTIES_PAGE_SIZE }, (_, index) => (
        <PropertyItemSkeleton key={index} />
      ))}
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function LandlordProperties({
  page,
  filter,
}: {
  page: number
  filter?: PropertyFilter
}) {
  const result = await authFetch<Property[]>(
    `/api/landlord/properties?page=${page}&limit=${PROPERTIES_PAGE_SIZE}${propertyFilterQuery(filter)}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: properties, meta } = result
  const total = meta?.total ?? properties.length
  const totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PAGE_SIZE))

  if (properties.length === 0) {
    // Past the last page, none for this filter, or no properties at all
    return (
      <div className="text-muted-foreground empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no properties on this page.</p>
            <Link
              href={propertiesHref(filter)}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : filter ? (
          <p>You have no {propertyFilterLabel(filter).toLowerCase()} properties.</p>
        ) : (
          <>
            <p>You haven&apos;t listed any properties yet.</p>
            <Link
              href="/dashboard/properties/add"
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Add property
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyItem key={property.id} property={property} />
        ))}
      </ul>
      <Pagination
        label="Properties pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => propertiesHref(filter, target)}
        scrollTo="properties"
      />
    </div>
  )
}

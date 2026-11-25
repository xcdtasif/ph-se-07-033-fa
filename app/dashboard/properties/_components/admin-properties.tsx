import Link from "next/link"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { ClippedWords } from "@/components/shared/clipped-words"
import { HiddenBadge } from "@/components/shared/hidden-badge"
import { HideButton } from "@/components/shared/hide-button"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { BANNED_COLORS } from "@/components/shared/pill-colors"
import { PropertyStatusBadge } from "@/components/shared/property-status-badge"
import {
  propertyFilterLabel,
  propertyFilterQuery,
  type PropertyFilter,
} from "@/components/shared/property-status-filter"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authFetch } from "@/lib/auth-fetch"
import { propertiesHref } from "@/lib/dashboard"
import { formatShortDate } from "@/lib/format"
import type { AdminProperty } from "@/lib/types"
import { cn } from "@/lib/utils"

import { setPropertyHiddenAction } from "../_actions/property-actions"

const PROPERTIES_PAGE_SIZE = 10

/*
Like the users table: the date, badge and button columns are fixed widths that fit the widest of
each ("31-12-99", "Unavailable", "Visible", "Unhide") with the cell's padding, so they never clip.
The property and landlord share what's left, three fifths to the property and two fifths to the
landlord, by spanning three and two columns.
*/
const PROPERTY_SPAN = 3
const LANDLORD_SPAN = 2

const COLUMNS = [
  { label: "Property", width: undefined, span: PROPERTY_SPAN },
  { label: "Landlord", width: undefined, span: LANDLORD_SPAN },
  { label: "Listed", width: "w-28", span: 1 },
  { label: "Status", width: "w-32", span: 1 },
  { label: "Visibility", width: "w-28", span: 1 },
  { label: "Action", width: "w-28", span: 1 },
]

/*
A bordered card around the table like the users one, at least 52rem wide: the four fixed
columns' 29rem, then 23rem shared, about 13.8rem for the property and 9.2rem for the landlord. A narrower screen scrolls
sideways, and text too long for its column ends in "…". Every row is as tall as one with a
button. No header row on screen; screen readers still get the column names.
*/
function PropertiesFrame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table className="min-w-208 table-fixed [&_td]:h-11 [&_td]:truncate [&_td]:px-4">
        <colgroup>
          {COLUMNS.map(({ label, width, span }) => (
            <col key={label} span={span} className={width} />
          ))}
        </colgroup>
        <TableHeader className="sr-only">
          <TableRow>
            {COLUMNS.map(({ label, span }) => (
              <TableHead key={label} colSpan={span}>
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  )
}

/*
Whether tenants can see the property: Hidden when an admin hid it, Banned when its landlord is
banned, else Visible. Neither changes the status. Hidden comes first, since the row's button
undoes it; a banned landlord's property comes back when they're unbanned.
*/
function VisibilityBadge({ property }: { property: AdminProperty }) {
  if (property.isHidden) {
    return <HiddenBadge />
  }

  if (property.landlord.isBanned) {
    return (
      <Badge className={BANNED_COLORS}>
        Banned<span className="sr-only"> landlord</span>
      </Badge>
    )
  }

  return <Badge variant="outline">Visible</Badge>
}

export function AdminPropertiesSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <PropertiesFrame>
        {Array.from({ length: PROPERTIES_PAGE_SIZE }, (_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell colSpan={PROPERTY_SPAN}>
              <SkeletonText className="w-4/5" />
            </TableCell>
            <TableCell colSpan={LANDLORD_SPAN}>
              <SkeletonText className="w-3/4" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-16" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-5 w-18 rounded-4xl" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-5 w-14 rounded-4xl" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-7 w-14 rounded-lg" />
            </TableCell>
          </TableRow>
        ))}
      </PropertiesFrame>
      <PaginationSkeleton />
    </div>
  )
}

type AdminPropertiesProps = {
  page: number
  filter?: PropertyFilter
  search?: string
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function AdminProperties({ page, filter, search }: AdminPropertiesProps) {
  const query = `${propertyFilterQuery(filter, true)}${search ? `&search=${encodeURIComponent(search)}` : ""}`
  const result = await authFetch<AdminProperty[]>(
    `/api/admin/properties?page=${page}&limit=${PROPERTIES_PAGE_SIZE}${query}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: properties, meta } = result
  const total = meta?.total ?? properties.length
  const totalPages = Math.max(1, Math.ceil(total / PROPERTIES_PAGE_SIZE))

  if (properties.length === 0) {
    // Past the last page, nothing matching the search, or none with this filter
    return (
      <div className="empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no properties on this page.</p>
            <Link
              href={propertiesHref({ filter, search })}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : search ? (
          <p>No properties match your search.</p>
        ) : (
          <p>No {filter ? `${propertyFilterLabel(filter).toLowerCase()} ` : ""}properties.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PropertiesFrame>
        {properties.map((property) => (
          <TableRow key={property.id}>
            {/*
            Tenants can open it unless it's hidden or its landlord is banned; then its public page
            doesn't open, so the name is plain text, and muted
            */}
            <TableCell
              colSpan={PROPERTY_SPAN}
              className={cn(
                "font-medium",
                (property.isHidden || property.landlord.isBanned) && "text-muted-foreground",
              )}
              title={property.name}
            >
              {property.isHidden || property.landlord.isBanned ? (
                <ClippedWords text={property.name} />
              ) : (
                <Link href={`/properties/${property.id}`} className="group">
                  <ClippedWords text={property.name} underline />
                </Link>
              )}
            </TableCell>
            <TableCell
              colSpan={LANDLORD_SPAN}
              className="text-muted-foreground"
              title={`${property.landlord.name} (${property.landlord.email})`}
            >
              <ClippedWords text={property.landlord.name} />
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatShortDate(property.createdAt)}
            </TableCell>
            <TableCell>
              <PropertyStatusBadge status={property.status} />
            </TableCell>
            <TableCell>
              <VisibilityBadge property={property} />
            </TableCell>
            {/* The button's focus ring needs room past the cell */}
            <TableCell className="overflow-visible!">
              <HideButton
                isHidden={property.isHidden}
                action={setPropertyHiddenAction.bind(null, property.id)}
                noun="property"
                description="Tenants can't find, request or pay for it until it's unhidden."
              />
            </TableCell>
          </TableRow>
        ))}
      </PropertiesFrame>
      <Pagination
        label="Properties pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => propertiesHref({ filter, search, page: target })}
        scrollTo="properties"
      />
    </div>
  )
}

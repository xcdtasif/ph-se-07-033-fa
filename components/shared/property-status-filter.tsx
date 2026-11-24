import { PROPERTY_STATUSES, type PropertyStatus } from "@/lib/types"

import { BANNED_COLORS } from "./banned-colors"
import { HIDDEN_PILL_COLORS } from "./hidden-badge"
import { propertyStatusColors, propertyStatusLabel } from "./property-status-badge"
import { StatusFilter } from "./status-filter"

/*
A status shows that status's visible properties; HIDDEN shows the ones an admin has hidden,
whatever their status; BANNED (the admin's only) shows the rest of those tenants can't see, whose
landlord is banned. All (undefined) shows everything, so each property is under All and one other
*/
export type PropertyFilter = PropertyStatus | "HIDDEN" | "BANNED"

// The landlord's filters; a banned landlord can't log in, so they have no Banned one
const LANDLORD_FILTERS: readonly PropertyFilter[] = [...PROPERTY_STATUSES, "HIDDEN"]
const ADMIN_FILTERS: readonly PropertyFilter[] = [...PROPERTY_STATUSES, "BANNED", "HIDDEN"]

const filtersFor = (admin: boolean) => (admin ? ADMIN_FILTERS : LANDLORD_FILTERS)

// `?status=` as one of the role's property filters, undefined (all) for anything else
export const parsePropertyFilter = (value: string | string[] | undefined, admin = false) =>
  filtersFor(admin).find((filter) => filter === value)

export const propertyFilterLabel = (filter: PropertyFilter) =>
  filter === "HIDDEN" ? "Hidden" : filter === "BANNED" ? "Banned" : propertyStatusLabel(filter)

/*
The backend's query for a filter: hidden ones by themselves, then (the admin's) banned landlords'
ones, and a status without either. The landlord's list takes no isLandlordBanned
*/
export const propertyFilterQuery = (filter?: PropertyFilter, admin = false) => {
  if (!filter) {
    return ""
  }

  if (filter === "HIDDEN") {
    return "&isHidden=true"
  }

  if (filter === "BANNED") {
    return "&isHidden=false&isLandlordBanned=true"
  }

  return `&status=${filter}&isHidden=false${admin ? "&isLandlordBanned=false" : ""}`
}

const filterColors = (filter: PropertyFilter) =>
  filter === "HIDDEN"
    ? HIDDEN_PILL_COLORS
    : filter === "BANNED"
      ? BANNED_COLORS
      : propertyStatusColors(filter)

type PropertyStatusFilterProps = {
  filter?: PropertyFilter
  href: (filter?: PropertyFilter) => string
  listId: string
  // Adds the Banned pill
  admin?: boolean
}

export function PropertyStatusFilter({
  filter,
  href,
  listId,
  admin = false,
}: PropertyStatusFilterProps) {
  return (
    <StatusFilter
      label="Filter properties by status"
      statuses={filtersFor(admin)}
      status={filter}
      href={href}
      statusLabel={propertyFilterLabel}
      statusColors={filterColors}
      listId={listId}
    />
  )
}

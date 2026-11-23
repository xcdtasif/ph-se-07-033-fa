import { PROPERTY_STATUSES, type PropertyStatus } from "@/lib/types"

import { HIDDEN_COLORS } from "./hidden-badge"
import { propertyStatusColors, propertyStatusLabel } from "./property-status-badge"
import { StatusFilter } from "./status-filter"

/*
A status shows that status's visible properties; HIDDEN shows the ones an admin has hidden,
whatever their status. All (undefined) shows everything
*/
export type PropertyFilter = PropertyStatus | "HIDDEN"

const PROPERTY_FILTERS: readonly PropertyFilter[] = [...PROPERTY_STATUSES, "HIDDEN"]

// `?status=` as a property filter, undefined (all) for anything else
export const parsePropertyFilter = (value: string | string[] | undefined) =>
  PROPERTY_FILTERS.find((filter) => filter === value)

export const propertyFilterLabel = (filter: PropertyFilter) =>
  filter === "HIDDEN" ? "Hidden" : propertyStatusLabel(filter)

// The backend's query for a filter: hidden ones by themselves, a status without them
export const propertyFilterQuery = (filter?: PropertyFilter) =>
  !filter ? "" : filter === "HIDDEN" ? "&isHidden=true" : `&status=${filter}&isHidden=false`

type PropertyStatusFilterProps = {
  filter?: PropertyFilter
  href: (filter?: PropertyFilter) => string
}

export function PropertyStatusFilter({ filter, href }: PropertyStatusFilterProps) {
  return (
    <StatusFilter
      label="Filter properties by status"
      statuses={PROPERTY_FILTERS}
      status={filter}
      href={href}
      statusLabel={propertyFilterLabel}
      statusColors={(option) =>
        option === "HIDDEN" ? HIDDEN_COLORS : propertyStatusColors(option)
      }
    />
  )
}

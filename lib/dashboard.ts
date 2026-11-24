import type { PropertyFilter } from "@/components/shared/property-status-filter"
import type { ReviewFilter } from "@/components/shared/review-filter"

import type { RequestStatus, UserRole } from "./types"

export type DashboardSection = {
  href: string
  label: string
  // The role has this page only, not the pages under it (the landlord's property pages)
  exact?: boolean
}

/*
The dashboard pages each role has. `/dashboard` opens the first; a role with none sees no
Dashboard menu and is sent to its profile.
*/
export const DASHBOARD_SECTIONS: Record<UserRole, DashboardSection[]> = {
  TENANT: [
    { href: "/dashboard/requests", label: "Requests" },
    { href: "/dashboard/payments", label: "Payments" },
    { href: "/dashboard/reviews", label: "Reviews" },
  ],
  LANDLORD: [
    { href: "/dashboard/overview", label: "Overview" },
    { href: "/dashboard/properties", label: "Properties" },
    { href: "/dashboard/requests", label: "Requests" },
  ],
  ADMIN: [
    { href: "/dashboard/overview", label: "Overview" },
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/properties", label: "Properties", exact: true },
    { href: "/dashboard/requests", label: "Requests" },
    { href: "/dashboard/reviews", label: "Reviews" },
  ],
}

// The requests page's URL for a status filter and page, leaving defaults out of the query
export const requestsHref = (status?: RequestStatus, page = 1) => {
  const query = new URLSearchParams()

  if (status) {
    query.set("status", status)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const search = query.toString()

  return search ? `/dashboard/requests?${search}` : "/dashboard/requests"
}

/*
The properties page's URL for a filter, search (the admin's) and page, leaving defaults out of
the query
*/
export const propertiesHref = ({
  filter,
  search,
  page = 1,
}: {
  filter?: PropertyFilter
  search?: string
  page?: number
} = {}) => {
  const query = new URLSearchParams()

  if (filter) {
    query.set("status", filter)
  }

  if (search) {
    query.set("search", search)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const text = query.toString()

  return text ? `/dashboard/properties?${text}` : "/dashboard/properties"
}

// The reviews page's URL for a filter (the admin's) and page, leaving defaults out of the query
export const reviewsHref = ({
  filter,
  page = 1,
}: { filter?: ReviewFilter; page?: number } = {}) => {
  const query = new URLSearchParams()

  if (filter) {
    query.set("status", filter)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const text = query.toString()

  return text ? `/dashboard/reviews?${text}` : "/dashboard/reviews"
}

import { Building2, CreditCard, Inbox, Star, Tags, Users, type LucideIcon } from "lucide-react"

import type { PropertyFilter } from "@/components/shared/property-status-filter"
import type { ReviewFilter } from "@/components/shared/review-filter"

import type { RequestStatus, UserRole } from "./types"

export type DashboardSection = {
  href: string
  label: string
  icon: LucideIcon
  // The role has this page only, not the pages under it (the landlord's property pages)
  exact?: boolean
}

/*
The dashboard pages each role has, shown as cards at the top of `/dashboard`. The proxy sends a
role away from another role's page.
*/
export const DASHBOARD_SECTIONS: Record<UserRole, DashboardSection[]> = {
  TENANT: [
    { href: "/dashboard/requests", label: "Requests", icon: Inbox },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  ],
  LANDLORD: [
    { href: "/dashboard/properties", label: "Properties", icon: Building2 },
    { href: "/dashboard/requests", label: "Requests", icon: Inbox },
  ],
  ADMIN: [
    { href: "/dashboard/users", label: "Users", icon: Users },
    { href: "/dashboard/categories", label: "Categories", icon: Tags },
    { href: "/dashboard/properties", label: "Properties", icon: Building2, exact: true },
    { href: "/dashboard/requests", label: "Requests", icon: Inbox },
    { href: "/dashboard/reviews", label: "Reviews", icon: Star },
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

// The categories page's URL for a search and page, leaving defaults out of the query
export const categoriesHref = ({ search, page = 1 }: { search?: string; page?: number } = {}) => {
  const query = new URLSearchParams()

  if (search) {
    query.set("search", search)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const text = query.toString()

  return text ? `/dashboard/categories?${text}` : "/dashboard/categories"
}

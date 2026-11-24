import type { RequestStatus, UserRole } from "./types"

export type DashboardSection = { href: string; label: string }

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
  ADMIN: [{ href: "/dashboard/overview", label: "Overview" }],
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

// The reviews page's URL for a page, leaving the first page out of the query
export const reviewsHref = (page = 1) =>
  page > 1 ? `/dashboard/reviews?page=${page}` : "/dashboard/reviews"

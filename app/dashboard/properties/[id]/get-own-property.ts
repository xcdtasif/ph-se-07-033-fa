import { notFound } from "next/navigation"
import { cache } from "react"

import { authFetch } from "@/lib/auth-fetch"
import type { Property, RequestStatus } from "@/lib/types"

/*
The landlord's own property, hidden ones included, fetched once per request however many parts
of the page need it. Another landlord's property, a missing one or a malformed id is a 404.
*/
export const getOwnProperty = cache(async (id: string) => {
  const result = await authFetch<Property>(`/api/landlord/properties/${encodeURIComponent(id)}`)

  if (!result.success && [400, 403, 404].includes(result.statusCode)) {
    notFound()
  }

  return result
})

// The requests the property's page shows first: the ones waiting for the landlord
export const DEFAULT_REQUEST_STATUS: RequestStatus = "PENDING"

export type OwnPropertyQuery = {
  status?: RequestStatus
  requestsPage?: number
  reviewsPage?: number
}

// The property's dashboard page, leaving defaults out of the query
export const ownPropertyHref = (
  id: string,
  { status = DEFAULT_REQUEST_STATUS, requestsPage = 1, reviewsPage = 1 }: OwnPropertyQuery = {},
) => {
  const query = new URLSearchParams()

  if (status !== DEFAULT_REQUEST_STATUS) {
    query.set("status", status)
  }

  if (requestsPage > 1) {
    query.set("requestsPage", String(requestsPage))
  }

  if (reviewsPage > 1) {
    query.set("reviewsPage", String(reviewsPage))
  }

  const search = query.toString()

  return search ? `/dashboard/properties/${id}?${search}` : `/dashboard/properties/${id}`
}

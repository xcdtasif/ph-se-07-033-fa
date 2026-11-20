import { cacheLife } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Property, PropertyReview } from "@/lib/types"

/*
Public property reads, cached across requests for a few minutes. A failure is
returned (for <ApiError /> or notFound()) but cached only for seconds, so the
next try reaches the backend.
*/
const cacheFor = (success: boolean) => {
  if (success) {
    cacheLife("minutes")
  } else {
    cacheLife("seconds")
  }
}

// `query` is the search string without "?", e.g. "limit=6"
export const getProperties = async (query: string) => {
  "use cache"

  const result = await apiFetch<Property[]>(`/api/properties?${query}`)
  cacheFor(result.success)

  return result
}

// Any status, unless hidden: 404 for a hidden or missing property, 400 for a malformed id
export const getProperty = async (id: string) => {
  "use cache"

  const result = await apiFetch<Property>(`/api/properties/${encodeURIComponent(id)}`)
  cacheFor(result.success)

  return result
}

// Visible reviews, newest first
export const getPropertyReviews = async (id: string, page: number, limit: number) => {
  "use cache"

  const result = await apiFetch<PropertyReview[]>(
    `/api/properties/${encodeURIComponent(id)}/reviews?page=${page}&limit=${limit}`,
  )
  cacheFor(result.success)

  return result
}

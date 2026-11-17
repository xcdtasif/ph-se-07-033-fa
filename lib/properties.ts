import { cacheLife } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Property } from "@/lib/types"

/*
Public property list, cached across requests for a few minutes. `query` is the
search string without "?", e.g. "limit=6". A failed call throws (to error.tsx)
instead of returning, so the failure isn't cached.
*/
export const getProperties = async (query: string) => {
  "use cache"
  cacheLife("minutes")

  const result = await apiFetch<Property[]>(`/api/properties?${query}`)

  if (!result.success) {
    throw new Error(result.message)
  }

  return { properties: result.data, meta: result.meta }
}

import { cacheLife } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Property } from "@/lib/types"

/*
Public property list, cached across requests for a few minutes. `query` is the
search string without "?", e.g. "limit=6". A failure is returned (for
<ApiError />) but cached only for seconds, so the next try reaches the backend.
*/
export const getProperties = async (query: string) => {
  "use cache"

  const result = await apiFetch<Property[]>(`/api/properties?${query}`)

  if (result.success) {
    cacheLife("minutes")
  } else {
    cacheLife("seconds")
  }

  return result
}

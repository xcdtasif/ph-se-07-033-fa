import { cacheLife } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Category } from "@/lib/types"

// All categories, A to Z, cached like the property list. A failed call throws, so it isn't cached
export const getCategories = async () => {
  "use cache"
  cacheLife("minutes")

  const result = await apiFetch<Category[]>("/api/categories")

  if (!result.success) {
    throw new Error(result.message)
  }

  return result.data
}

import { cacheLife } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Category } from "@/lib/types"

// All categories, A to Z, cached like the property list: a failure only for seconds
export const getCategories = async () => {
  "use cache"

  const result = await apiFetch<Category[]>("/api/categories")

  if (result.success) {
    cacheLife("minutes")
  } else {
    cacheLife("seconds")
  }

  return result
}

import { cacheLife, cacheTag, updateTag } from "next/cache"

import { apiFetch } from "@/lib/api"
import type { Category } from "@/lib/types"

// The cached list, and the property pages showing one category's name
const CATEGORIES_TAG = "categories"
export const categoryTag = (id: string) => `category:${id}`

/*
For server actions only. After an admin's change the list is fetched afresh on the next visit;
a renamed category's name is on its properties' pages too, so those expire with it
*/
export const expireCategoryCaches = (categoryId?: string) => {
  updateTag(CATEGORIES_TAG)

  if (categoryId) {
    updateTag(categoryTag(categoryId))
  }
}

// All categories, A to Z, cached like the property list: a failure only for seconds
export const getCategories = async () => {
  "use cache"
  cacheTag(CATEGORIES_TAG)

  const result = await apiFetch<Category[]>("/api/categories")

  if (result.success) {
    cacheLife("minutes")
  } else {
    cacheLife("seconds")
  }

  return result
}

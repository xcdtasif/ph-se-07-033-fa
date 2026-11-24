import Link from "next/link"

import { ApiError } from "@/components/shared/api-error"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { authFetch } from "@/lib/auth-fetch"
import { categoriesHref } from "@/lib/dashboard"
import type { Category } from "@/lib/types"

import { DeleteCategoryDialog } from "./delete-category-dialog"
import { RenameCategoryDialog } from "./rename-category-dialog"

const CATEGORIES_PAGE_SIZE = 10

// The profile's card frame with no title; each row brings its own padding
const CARD = "gap-0 py-0"

export function CategoriesListSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <Card className={CARD}>
        <ul className="divide-y">
          {Array.from({ length: CATEGORIES_PAGE_SIZE }, (_, index) => (
            <li key={index} className="flex items-center gap-4 px-4 py-3">
              <SkeletonText className="w-32 flex-1 text-sm" />
              <div className="skeleton h-7 w-18 rounded-lg" />
              <div className="skeleton h-7 w-16 rounded-lg" />
            </li>
          ))}
        </ul>
      </Card>
      <PaginationSkeleton />
    </div>
  )
}

type CategoriesListProps = {
  page: number
  search?: string
}

/*
Per-user, uncached: reads cookies, so it sits inside <Suspense>. A card of rows, A to Z, each
with Rename and Delete, and the page links under it
*/
export async function CategoriesList({ page, search }: CategoriesListProps) {
  const query = search ? `&search=${encodeURIComponent(search)}` : ""
  const result = await authFetch<Category[]>(
    `/api/admin/categories?page=${page}&limit=${CATEGORIES_PAGE_SIZE}${query}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: categories, meta } = result
  const total = meta?.total ?? categories.length
  const totalPages = Math.max(1, Math.ceil(total / CATEGORIES_PAGE_SIZE))

  if (categories.length === 0) {
    // Past the last page, nothing matching the search, or none at all
    return (
      <div className="empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no categories on this page.</p>
            <Link
              href={categoriesHref({ search })}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : search ? (
          <p>No categories match your search.</p>
        ) : (
          <p>No categories yet.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className={CARD}>
        <ul className="divide-y">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-4 px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium" title={category.name}>
                {category.name}
              </span>
              <div className="flex shrink-0 gap-2">
                <RenameCategoryDialog category={category} />
                <DeleteCategoryDialog category={category} />
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Pagination
        label="Categories pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => categoriesHref({ search, page: target })}
        scrollTo="categories"
      />
    </div>
  )
}

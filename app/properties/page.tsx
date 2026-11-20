import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PropertyGrid, PropertyGridSkeleton } from "@/components/shared/property-grid"
import { buttonVariants } from "@/components/ui/button"
import { getCategories } from "@/lib/categories"
import { getProperties } from "@/lib/properties"

import { Pagination } from "./_components/pagination"
import { PropertyFiltersForm } from "./_components/property-filters-form"
import {
  hasActiveFilters,
  PAGE_SIZE,
  parseFilters,
  toQueryString,
  type PropertyFilters,
} from "./_schemas/property-filters"

export const metadata: Metadata = {
  title: "Properties",
}

async function PropertyResults({ filters }: { filters: PropertyFilters }) {
  const backendQuery = new URLSearchParams(toQueryString(filters))
  backendQuery.set("limit", String(PAGE_SIZE))

  const result = await getProperties(backendQuery.toString())

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: properties, meta } = result
  const total = meta?.total ?? properties.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (properties.length === 0) {
    // Past the last page (e.g. after properties were removed) vs. nothing matching at all
    const pastLastPage = total > 0
    const firstPageQuery = toQueryString({ ...filters, page: 1 })

    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          {pastLastPage
            ? "There are no properties on this page."
            : hasActiveFilters(filters)
              ? "No properties match your filters."
              : "No properties are listed yet. Check back soon."}
        </p>
        {pastLastPage ? (
          <Link
            href={firstPageQuery ? `/properties?${firstPageQuery}` : "/properties"}
            className={buttonVariants({ variant: "outline" })}
          >
            Go to the first page
          </Link>
        ) : (
          hasActiveFilters(filters) && (
            <Link href="/properties" className={buttonVariants({ variant: "outline" })}>
              Clear filters
            </Link>
          )
        )}
      </div>
    )
  }

  const first = (filters.page - 1) * PAGE_SIZE + 1
  const last = first + properties.length - 1

  return (
    <div className="flex flex-col gap-6">
      <p role="status" className="text-muted-foreground text-sm">
        Showing {first}–{last} of {total} {total === 1 ? "property" : "properties"}
      </p>
      <PropertyGrid properties={properties} />
      {totalPages > 1 && <Pagination filters={filters} totalPages={totalPages} />}
    </div>
  )
}

// Reads the URL, so it renders at request time behind the Suspense boundary below
async function PropertiesView({ searchParams }: Pick<PageProps<"/properties">, "searchParams">) {
  const filters = parseFilters(await searchParams)
  const categories = await getCategories()

  // The filters need the categories, so the error replaces both; the heading stays
  if (!categories.success) {
    return <ApiError error={categories} />
  }

  const query = toQueryString(filters)

  return (
    <>
      {/* Keyed by the query so the fields reset to the URL on back/forward */}
      <PropertyFiltersForm key={`form?${query}`} categories={categories.data} filters={filters} />
      {/* A new key shows the skeleton while the next page of results loads */}
      <Suspense key={`results?${query}`} fallback={<PropertyGridSkeleton count={PAGE_SIZE} />}>
        <PropertyResults filters={filters} />
      </Suspense>
    </>
  )
}

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
      <Suspense
        fallback={
          <>
            <div className="bg-muted h-48 animate-pulse rounded-xl lg:h-32" />
            <PropertyGridSkeleton count={PAGE_SIZE} />
          </>
        }
      >
        <PropertiesView searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

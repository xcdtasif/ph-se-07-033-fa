import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PageHeader } from "@/components/shared/page-header"
import { Pagination } from "@/components/shared/pagination"
import { PropertyGrid, PropertyGridSkeleton } from "@/components/shared/property-grid"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { buttonVariants } from "@/components/ui/button"
import { getCategories } from "@/lib/categories"
import { getProperties } from "@/lib/properties"

import {
  PropertyFiltersForm,
  PropertyFiltersFormSkeleton,
} from "./_components/property-filters-form"
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
      <div className="empty-state flex flex-col items-center gap-4">
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
            className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
          >
            Go to the first page
          </Link>
        ) : (
          hasActiveFilters(filters) && (
            <Link
              href="/properties"
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
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
      {/* A page change jumps here, to the first card, past the count above */}
      <div id="results" className="jump-target-6 flex flex-col gap-6">
        <PropertyGrid properties={properties} />
        <Pagination
          page={filters.page}
          totalPages={totalPages}
          href={(page) => {
            const query = toQueryString({ ...filters, page })

            return query ? `/properties?${query}` : "/properties"
          }}
          scrollTo="results"
        />
      </div>
    </div>
  )
}

// The results while they load: the count line above the grid too, so the cards don't move down
function PropertyResultsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <SkeletonText className="w-52 text-sm" />
      <PropertyGridSkeleton count={PAGE_SIZE} />
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

  return (
    <>
      <PropertyFiltersForm categories={categories.data} filters={filters} />
      {/*
      A filter or page change keeps the current cards, faded, until the new results swap in (a
      transition), so nothing above them moves
      */}
      <section aria-label="Results">
        <Suspense fallback={<PropertyResultsSkeleton />}>
          <PropertyResults filters={filters} />
        </Suspense>
      </section>
    </>
  )
}

export default function PropertiesPage({ searchParams }: PageProps<"/properties">) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Properties" />
      <Suspense
        fallback={
          <>
            <PropertyFiltersFormSkeleton />
            <PropertyResultsSkeleton />
          </>
        }
      >
        <PropertiesView searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

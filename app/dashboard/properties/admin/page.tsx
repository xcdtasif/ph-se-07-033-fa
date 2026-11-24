import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import {
  parsePropertyFilter,
  PropertyStatusFilter,
} from "@/components/shared/property-status-filter"
import { SearchBox } from "@/components/shared/search-box"
import { propertiesHref } from "@/lib/dashboard"
import { parsePage, parseSearch } from "@/lib/pagination"

import { AdminProperties, AdminPropertiesSkeleton } from "../_components/admin-properties"

export const metadata: Metadata = {
  title: "Properties",
}

/*
Reads the URL, so it renders at request time. A new search, status or page keeps the current
rows, faded, until the next ones swap in (a transition), so nothing above them moves.
*/
async function PropertiesList({
  searchParams,
}: Pick<PageProps<"/dashboard/properties/admin">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const filter = parsePropertyFilter(query.status, true)
  const search = parseSearch(query.search)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <SearchBox
          id="property-search"
          label="Search properties"
          placeholder="Search by property, location or landlord"
          href={propertiesHref({ filter })}
          search={search}
          listId="properties"
        />
        <PropertyStatusFilter
          filter={filter}
          href={(option) => propertiesHref({ filter: option, search })}
          listId="properties"
          admin
        />
      </div>
      {/* A page change jumps here, to the first row */}
      <div id="properties" className="jump-target-4">
        <Suspense fallback={<AdminPropertiesSkeleton />}>
          <AdminProperties page={page} filter={filter} search={search} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the search box and the strip's row too, so the table doesn't move down
function PropertiesPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-4">
        <div className="skeleton h-8 w-full max-w-sm rounded-lg" />
        <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      </div>
      <AdminPropertiesSkeleton />
    </div>
  )
}

// Every property on the platform, hidden ones too; the proxy shows it at /dashboard/properties
export default function AdminPropertiesPage({
  searchParams,
}: PageProps<"/dashboard/properties/admin">) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Properties" />
      <Suspense fallback={<PropertiesPageSkeleton />}>
        <PropertiesList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

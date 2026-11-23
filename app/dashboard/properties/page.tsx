import type { Metadata } from "next"
import { Suspense } from "react"

import {
  parsePropertyFilter,
  PropertyStatusFilter,
} from "@/components/shared/property-status-filter"
import { parsePage } from "@/lib/pagination"

import {
  LandlordProperties,
  LandlordPropertiesSkeleton,
  propertiesHref,
} from "./_components/landlord-properties"

export const metadata: Metadata = {
  title: "Properties",
}

/*
Reads the URL, so it renders at request time. A new filter shows the skeleton again; a
new page keeps the current cards until the next page swaps in, so nothing above moves.
*/
async function PropertiesList({
  searchParams,
}: Pick<PageProps<"/dashboard/properties">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const filter = parsePropertyFilter(query.status)

  return (
    <div className="flex flex-col gap-6">
      <PropertyStatusFilter filter={filter} href={(option) => propertiesHref(option)} />
      {/* A page change jumps here, to the first card */}
      <div id="properties" className="jump-target-4">
        <Suspense key={filter} fallback={<LandlordPropertiesSkeleton />}>
          <LandlordProperties page={page} filter={filter} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the status links' row too, so the cards don't move down when it arrives
function PropertiesPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      <LandlordPropertiesSkeleton />
    </div>
  )
}

export default function PropertiesPage({ searchParams }: PageProps<"/dashboard/properties">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
      <Suspense fallback={<PropertiesPageSkeleton />}>
        <PropertiesList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

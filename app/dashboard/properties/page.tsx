import type { Metadata } from "next"
import { Suspense } from "react"

import { parsePage } from "@/lib/pagination"

import { LandlordProperties, LandlordPropertiesSkeleton } from "./_components/landlord-properties"

export const metadata: Metadata = {
  title: "Properties",
}

/*
Reads the URL, so it renders at request time. A new page keeps the current cards until the
next page swaps in.
*/
async function PropertiesList({
  searchParams,
}: Pick<PageProps<"/dashboard/properties">, "searchParams">) {
  return <LandlordProperties page={parsePage((await searchParams).page)} />
}

export default function PropertiesPage({ searchParams }: PageProps<"/dashboard/properties">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
      {/* A page change jumps here, to the first card */}
      <div id="properties" className="jump-target-4">
        <Suspense fallback={<LandlordPropertiesSkeleton />}>
          <PropertiesList searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  )
}

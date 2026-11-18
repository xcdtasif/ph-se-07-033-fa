import Link from "next/link"
import { Suspense } from "react"

import { PropertyGrid, PropertyGridSkeleton } from "@/components/shared/property-grid"
import { buttonVariants } from "@/components/ui/button"
import { getProperties } from "@/lib/properties"

const FEATURED_COUNT = 6

async function FeaturedProperties() {
  // The newest available properties
  const { properties } = await getProperties(`limit=${FEATURED_COUNT}`)

  if (properties.length === 0) {
    return (
      <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center">
        No properties are listed yet. Check back soon.
      </p>
    )
  }

  return <PropertyGrid properties={properties} />
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-4 py-12 text-center sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Find your next home with RentNest
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty">
          Search for properties, send requests to landlords, and pay deposits securely.
        </p>
        <Link href="/properties" className={buttonVariants({ size: "lg" })}>
          Browse properties
        </Link>
      </section>

      <section aria-labelledby="featured-heading" className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="featured-heading" className="text-2xl font-semibold tracking-tight">
            Featured properties
          </h2>
          <Link href="/properties" className="text-sm font-medium underline underline-offset-4">
            View all
          </Link>
        </div>
        <Suspense fallback={<PropertyGridSkeleton count={FEATURED_COUNT} />}>
          <FeaturedProperties />
        </Suspense>
      </section>
    </div>
  )
}

import { Suspense } from "react"

import { PropertyCard } from "@/components/shared/property-card"
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

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, index) => (
        <li key={property.id} className="flex">
          <PropertyCard property={property} eager={index < 3} />
        </li>
      ))}
    </ul>
  )
}

function FeaturedPropertiesSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: FEATURED_COUNT }, (_, index) => (
        <div key={index} className="bg-muted h-80 animate-pulse rounded-xl" />
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16">
      <section className="flex flex-col items-center gap-4 py-12 text-center sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Find your next home with RentNest
        </h1>
        <p className="text-muted-foreground max-w-xl text-lg text-pretty">
          Browse rental properties, send a request to the landlord and pay your deposit securely.
        </p>
      </section>

      <section aria-labelledby="featured-heading" className="flex flex-col gap-6">
        <h2 id="featured-heading" className="text-2xl font-semibold tracking-tight">
          Featured properties
        </h2>
        <Suspense fallback={<FeaturedPropertiesSkeleton />}>
          <FeaturedProperties />
        </Suspense>
      </section>
    </div>
  )
}

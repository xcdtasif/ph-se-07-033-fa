import type { Property } from "@/lib/types"

import { PropertyCard } from "./property-card"

const GRID_CLASS = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"

// The first row loads its images right away, since it's visible without scrolling
export function PropertyGrid({ properties }: { properties: Property[] }) {
  return (
    <ul className={GRID_CLASS}>
      {properties.map((property, index) => (
        <li key={property.id} className="flex">
          <PropertyCard property={property} eager={index < 3} />
        </li>
      ))}
    </ul>
  )
}

export function PropertyGridSkeleton({ count }: { count: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="skeleton h-80 rounded-xl" />
      ))}
    </div>
  )
}

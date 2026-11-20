import { ArrowLeft, MapPin } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { Rating } from "@/components/shared/rating"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { getProperty } from "@/lib/properties"
import type { PropertyStatus } from "@/lib/types"

import { PropertyGallery } from "./_components/property-gallery"
import {
  parseReviewsPage,
  PropertyReviews,
  REVIEWS_PAGE_SIZE,
} from "./_components/property-reviews"
import { RequestToRent } from "./_components/request-to-rent"

const STATUSES: Record<PropertyStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Available", className: "bg-emerald-100 text-emerald-800" },
  RESERVED: { label: "Reserved", className: "bg-amber-100 text-amber-800" },
  RENTED: { label: "Rented", className: "bg-sky-100 text-sky-800" },
  UNAVAILABLE: { label: "Unavailable", className: "bg-muted text-muted-foreground" },
}

export async function generateMetadata({
  params,
}: PageProps<"/properties/[id]">): Promise<Metadata> {
  const { id } = await params
  const result = await getProperty(id)

  return { title: result.success ? result.data.name : "Property" }
}

// A missing, hidden or malformed id is a 404 page; other failures show in place
async function PropertyDetails({ params, searchParams }: PageProps<"/properties/[id]">) {
  const { id } = await params
  const result = await getProperty(id)

  if (!result.success) {
    if (result.statusCode === 404 || result.statusCode === 400) {
      notFound()
    }

    return <ApiError error={result} />
  }

  const property = result.data
  const status = STATUSES[property.status]
  const { name, category, location, averageRating, reviewCount } = property
  const details = [
    { label: "Deposit", value: formatMoney(property.deposit) },
    {
      label: "Rating",
      value: (
        <Rating averageRating={averageRating} reviewCount={reviewCount} className="justify-end" />
      ),
    },
    { label: "Landlord", value: property.landlord.name },
    { label: "Listed since", value: formatDate(property.createdAt) },
  ]

  /*
  Phones read top to bottom: photos and title, the rent card, then description and reviews.
  Desktop has two columns: everything else on the left, the card on the right beside it
  */
  return (
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-6">
        <PropertyGallery images={property.images} name={name} />

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {category.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {location}
          </p>
        </div>
      </div>

      {/*
      Sticks at the same offset it starts at, so it never shifts while scrolling:
      navbar (3.5rem + 1px border), main's top padding (2rem), back link (1.25rem), gap (2rem)
      */}
      <aside className="lg:sticky lg:top-35.25 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <p>
                <span className="text-2xl font-semibold">{formatMoney(property.rent)}</span>
                <span className="text-muted-foreground text-sm"> / month</span>
              </p>
              <Badge className={status.className}>{status.label}</Badge>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {details.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="truncate text-right">{value}</dd>
                </div>
              ))}
            </dl>
            <Suspense fallback={<div className="bg-muted h-10 animate-pulse rounded-lg" />}>
              <RequestToRent property={property} />
            </Suspense>
          </CardContent>
        </Card>
      </aside>

      <div className="flex flex-col gap-8 lg:col-start-1">
        <section aria-labelledby="description-heading" className="flex flex-col gap-2">
          <h2 id="description-heading" className="text-lg font-semibold">
            Description
          </h2>
          <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
        </section>

        <section aria-labelledby="reviews-heading" className="flex flex-col gap-4">
          <h2 id="reviews-heading" className="text-lg font-semibold">
            Reviews
          </h2>
          <Suspense fallback={<ReviewsSkeleton />}>
            <ReviewsPage propertyId={property.id} searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </div>
  )
}

// Reads the URL, so it renders at request time; a new page shows the skeleton again
async function ReviewsPage({
  propertyId,
  searchParams,
}: {
  propertyId: string
  searchParams: PageProps<"/properties/[id]">["searchParams"]
}) {
  const page = parseReviewsPage((await searchParams).reviewsPage)

  return (
    <Suspense key={page} fallback={<ReviewsSkeleton />}>
      <PropertyReviews propertyId={propertyId} page={page} />
    </Suspense>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {Array.from({ length: REVIEWS_PAGE_SIZE }, (_, index) => (
        <div key={index} className="bg-muted h-24 animate-pulse rounded-xl" />
      ))}
    </div>
  )
}

function PropertyDetailsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-hidden="true">
      <div className="flex flex-col gap-6">
        <div className="bg-muted aspect-3/2 animate-pulse rounded-xl" />
        <div className="bg-muted h-24 animate-pulse rounded-xl" />
      </div>
      <div className="bg-muted h-64 animate-pulse rounded-xl" />
    </div>
  )
}

export default function PropertyPage(props: PageProps<"/properties/[id]">) {
  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/properties"
        className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All properties
      </Link>
      <Suspense fallback={<PropertyDetailsSkeleton />}>
        <PropertyDetails {...props} />
      </Suspense>
    </div>
  )
}

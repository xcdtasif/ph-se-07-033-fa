import { MapPin } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PageHeader } from "@/components/shared/page-header"
import { propertyStatusLabel } from "@/components/shared/property-status-badge"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatMoney } from "@/lib/format"
import { parsePage } from "@/lib/pagination"
import { getProperty } from "@/lib/properties"

import { PropertyGallery } from "./_components/property-gallery"
import { PropertyReviews, PropertyReviewsSkeleton } from "./_components/property-reviews"
import { RequestToRent } from "./_components/request-to-rent"

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
  const { name, category, location, averageRating, reviewCount } = property
  const details = [
    { label: "Deposit", value: formatMoney(property.deposit) },
    { label: "Status", value: propertyStatusLabel(property.status) },
    { label: "Landlord", value: property.landlord.name },
    {
      label: "Rating (Reviews)",
      value: averageRating === null ? "N/A" : `${averageRating.toFixed(1)} (${reviewCount})`,
    },
    { label: "Listed since", value: formatDate(property.createdAt) },
  ]

  /*
  Phones read top to bottom: photos and title, the rent card, then description and reviews.
  Desktop has two columns: everything else on the left, the card on the right beside it.
  */
  return (
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-6">
        <PropertyGallery images={property.images} name={name} />

        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            {category.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <p className="text-muted-foreground flex items-center gap-1 text-sm">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {location}
          </p>
        </div>
      </div>

      {/*
      Sticks at the same offset it starts at, so it never shifts while scrolling:
      navbar (3.5rem + 1px border), main's top padding (2rem), the back link's row (2rem, as tall
      as a page heading), gap (2rem)
      */}
      <aside className="lg:sticky lg:top-38.25 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-4">
            {/* One text-2xl line, as tall as its skeleton; the smaller "/ month" sits inside it */}
            <p className="text-2xl">
              <span className="font-semibold">{formatMoney(property.rent)}</span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {details.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="truncate text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {/*
            The footer, as on the request cards: mt-2 on top of the 1rem gap is 1.5rem
            above the line, 1rem below. A note is as tall as the button.
            */}
            <div className="divider-dashed mt-2 flex justify-center pt-4">
              <Suspense fallback={<div className="skeleton h-7 w-32 rounded-lg" />}>
                <RequestToRent property={property} />
              </Suspense>
            </div>
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
          {/* A page change jumps here, to the first review */}
          <div id="reviews" className="jump-target-4">
            <Suspense fallback={<PropertyReviewsSkeleton count={reviewCount} />}>
              <ReviewsPage propertyId={property.id} searchParams={searchParams} />
            </Suspense>
          </div>
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
  const page = parsePage((await searchParams).reviewsPage)

  // No Suspense key: a page change keeps the current reviews until the next page swaps in
  return <PropertyReviews propertyId={propertyId} page={page} />
}

/*
The page while the property loads, in the same grid as PropertyDetails: photo and
thumbnails, the title block, the rent card (a row per detail), then description and reviews
*/
function PropertyDetailsSkeleton() {
  return (
    <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,1fr)_20rem]" aria-hidden="true">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="skeleton aspect-3/2 rounded-xl" />
          <div className="flex gap-3">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="pb-2.5">
                <div className="skeleton aspect-3/2 w-24 rounded-lg sm:w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonText className="w-24 text-xs" />
          <SkeletonText className="w-2/3 text-2xl" />
          <SkeletonText className="w-48 text-sm" />
        </div>
      </div>

      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <SkeletonText className="w-40 text-2xl" />
            <div className="flex flex-col gap-2 text-sm">
              {Array.from({ length: 5 }, (_, index) => (
                <SkeletonText key={index} />
              ))}
            </div>
            <div className="divider-dashed mt-2 flex justify-center pt-4">
              <div className="skeleton h-7 w-32 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-8 lg:col-start-1">
        <div className="flex flex-col gap-2">
          <SkeletonText className="w-28 text-lg" />
          <div>
            <SkeletonText />
            <SkeletonText />
            <SkeletonText className="w-1/2" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonText className="w-20 text-lg" />
          <PropertyReviewsSkeleton count={2} />
        </div>
      </div>
    </div>
  )
}

export default function PropertyPage(props: PageProps<"/properties/[id]">) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader back={{ href: "/properties", label: "All properties" }} />
      <Suspense fallback={<PropertyDetailsSkeleton />}>
        <PropertyDetails {...props} />
      </Suspense>
    </div>
  )
}

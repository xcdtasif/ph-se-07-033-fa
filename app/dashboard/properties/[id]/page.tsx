import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import {
  LandlordRequests,
  LandlordRequestsSkeleton,
} from "@/app/dashboard/requests/_components/landlord-requests"
import { PageHeader } from "@/components/shared/page-header"
import { parseRequestStatus, RequestStatusFilter } from "@/components/shared/request-status-filter"
import { buttonVariants } from "@/components/ui/button"
import { parsePage } from "@/lib/pagination"

import { OwnPropertyReviews, OwnPropertyReviewsSkeleton } from "./_components/own-property-reviews"
import { DEFAULT_REQUEST_STATUS, getOwnProperty, ownPropertyHref } from "./get-own-property"

type OwnPropertyPageProps = PageProps<"/dashboard/properties/[id]">

// The property's name, like its public page; the page already renders at request time
export async function generateMetadata({ params }: OwnPropertyPageProps): Promise<Metadata> {
  const result = await getOwnProperty((await params).id)

  return { title: result.success ? result.data.name : "Property" }
}

/*
The id and the query: the requests' status (pending unless another is chosen; there's no All)
and both lists' pages, each list keeping the rest in its links
*/
const readPage = async ({ params, searchParams }: OwnPropertyPageProps) => {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const current = {
    status: parseRequestStatus(query.status) ?? DEFAULT_REQUEST_STATUS,
    requestsPage: parsePage(query.requestsPage),
    reviewsPage: parsePage(query.reviewsPage),
  }

  // A 404 for another landlord's or a missing property, before either list asks for it
  await getOwnProperty(id)

  return { id, current }
}

/*
Opens the public page, which a hidden property no longer has; primary and on the right like
the properties page's Add property
*/
async function ViewListing({ params }: Pick<OwnPropertyPageProps, "params">) {
  const result = await getOwnProperty((await params).id)

  return result.success && !result.data.isHidden ? (
    <Link
      href={`/properties/${result.data.id}`}
      className={buttonVariants({ size: "sm", className: "text-sm" })}
    >
      View property
    </Link>
  ) : null
}

// The status strip, then that status's requests; a new status shows the skeleton again
async function Requests(props: OwnPropertyPageProps) {
  const { id, current } = await readPage(props)
  const { status } = current

  return (
    <div className="flex flex-col gap-6">
      <RequestStatusFilter
        status={status}
        // A new status starts from its first page
        href={(option) => ownPropertyHref(id, { ...current, status: option, requestsPage: 1 })}
        showAll={false}
      />
      {/* A page change jumps here, to the first card */}
      <div id="requests" className="jump-target-4">
        <Suspense key={status} fallback={<LandlordRequestsSkeleton showProperty={false} />}>
          <LandlordRequests
            page={current.requestsPage}
            status={status}
            property={{
              id,
              href: (page) => ownPropertyHref(id, { ...current, requestsPage: page }),
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}

// The strip's row and the cards, so the cards don't move down when the strip arrives
function RequestsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      <LandlordRequestsSkeleton showProperty={false} />
    </div>
  )
}

async function Reviews(props: OwnPropertyPageProps) {
  const { id, current } = await readPage(props)

  return (
    <OwnPropertyReviews
      propertyId={id}
      page={current.reviewsPage}
      href={(page) => ownPropertyHref(id, { ...current, reviewsPage: page })}
    />
  )
}

/*
One of the landlord's properties with its requests and reviews, newest first, each list with its
own pages. A new page keeps the current cards until the next page swaps in.
*/
export default function OwnPropertyPage(props: OwnPropertyPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        // No visible heading; the sections' headings sit under this one
        title="Property requests and reviews"
        back={{ href: "/dashboard/properties", label: "All properties" }}
        action={
          <Suspense fallback={<div className="skeleton h-7 w-24 rounded-lg" aria-hidden="true" />}>
            <ViewListing params={props.params} />
          </Suspense>
        }
      />
      <div className="flex flex-col gap-10">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Requests</h2>
          <Suspense fallback={<RequestsSkeleton />}>
            <Requests {...props} />
          </Suspense>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Reviews</h2>
          {/* A page change jumps here, to the first card */}
          <div id="reviews" className="jump-target-4">
            <Suspense fallback={<OwnPropertyReviewsSkeleton />}>
              <Reviews {...props} />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { parseReviewFilter, ReviewFilterStrip } from "@/components/shared/review-filter"
import { reviewsHref } from "@/lib/dashboard"
import { parsePage } from "@/lib/pagination"

import { AdminReviews, AdminReviewsSkeleton } from "../_components/admin-reviews"

export const metadata: Metadata = {
  title: "Reviews",
}

/*
Reads the URL, so it renders at request time. A new filter or page keeps the current cards,
faded, until the next ones swap in (a transition), so nothing above them moves.
*/
async function ReviewsList({
  searchParams,
}: Pick<PageProps<"/dashboard/reviews/admin">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const filter = parseReviewFilter(query.status)

  return (
    <div className="flex flex-col gap-6">
      <ReviewFilterStrip
        filter={filter}
        href={(option) => reviewsHref({ filter: option })}
        listId="reviews"
      />
      {/* A page change jumps here, to the first card */}
      <div id="reviews" className="jump-target-4">
        <Suspense fallback={<AdminReviewsSkeleton />}>
          <AdminReviews page={page} filter={filter} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the strip's row too, so the cards don't move down when they arrive
function ReviewsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      <AdminReviewsSkeleton />
    </div>
  )
}

// Every review on the platform, hidden ones too; the proxy shows it at /dashboard/reviews
export default function AdminReviewsPage({ searchParams }: PageProps<"/dashboard/reviews/admin">) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Reviews" />
      <Suspense fallback={<ReviewsPageSkeleton />}>
        <ReviewsList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

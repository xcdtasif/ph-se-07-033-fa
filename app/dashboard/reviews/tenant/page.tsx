import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { parsePage } from "@/lib/pagination"

import { TenantReviews, TenantReviewsSkeleton } from "../_components/tenant-reviews"

export const metadata: Metadata = {
  title: "Reviews",
}

/*
Reads the URL, so it renders at request time. A new page keeps the current cards until the
next page swaps in.
*/
async function ReviewsList({
  searchParams,
}: Pick<PageProps<"/dashboard/reviews/tenant">, "searchParams">) {
  return <TenantReviews page={parsePage((await searchParams).page)} />
}

// The tenant's own reviews; the proxy shows it at /dashboard/reviews
export default function TenantReviewsPage({
  searchParams,
}: PageProps<"/dashboard/reviews/tenant">) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Reviews" />
      {/* A page change jumps here, to the first card */}
      <div id="reviews" className="jump-target-4">
        <Suspense fallback={<TenantReviewsSkeleton />}>
          <ReviewsList searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"

import { parseRequestStatus, RequestStatusFilter } from "@/components/shared/request-status-filter"
import { parsePage } from "@/lib/pagination"

import { requestsHref, TenantRequests, TenantRequestsSkeleton } from "./_components/tenant-requests"

export const metadata: Metadata = {
  title: "Requests",
}

/*
Reads the URL, so it renders at request time. A new status shows the skeleton again; a
new page keeps the current cards until the next page swaps in, so nothing above moves.
*/
async function RequestsList({
  searchParams,
}: Pick<PageProps<"/dashboard/requests">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const status = parseRequestStatus(query.status)

  return (
    <div className="flex flex-col gap-6">
      <RequestStatusFilter status={status} href={(option) => requestsHref(option)} />
      {/* A page change jumps here, to the first card */}
      <div id="requests" className="jump-target-4">
        <Suspense key={status} fallback={<TenantRequestsSkeleton />}>
          <TenantRequests page={page} status={status} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the status links' row too, so the cards don't move down when it arrives
function RequestsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      <TenantRequestsSkeleton />
    </div>
  )
}

export default function RequestsPage({ searchParams }: PageProps<"/dashboard/requests">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
      <Suspense fallback={<RequestsPageSkeleton />}>
        <RequestsList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"

import { parseRequestStatus, RequestStatusFilter } from "@/components/shared/request-status-filter"
import { parsePage } from "@/lib/pagination"

import { requestsHref, TenantRequests } from "./_components/tenant-requests"

export const metadata: Metadata = {
  title: "Requests",
}

/*
Reads the URL, so it renders at request time. A new status shows the skeleton again; a
new page keeps the current cards until the next page swaps in, so nothing above moves.
*/
async function RequestsPage({
  searchParams,
}: Pick<PageProps<"/dashboard/tenant">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const status = parseRequestStatus(query.status)

  return (
    <div className="flex flex-col gap-6">
      <RequestStatusFilter status={status} href={(option) => requestsHref(option)} />
      {/* A page change jumps here, to the first card */}
      <div id="requests" className="jump-target-4">
        <Suspense key={status} fallback={<RequestsSkeleton />}>
          <TenantRequests page={page} status={status} />
        </Suspense>
      </div>
    </div>
  )
}

function RequestsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="skeleton h-64 rounded-xl" />
      ))}
    </div>
  )
}

export default function TenantDashboardPage({ searchParams }: PageProps<"/dashboard/tenant">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsPage searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

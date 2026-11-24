import { Suspense, type ComponentType, type ReactNode } from "react"

import { parseRequestStatus, RequestStatusFilter } from "@/components/shared/request-status-filter"
import { requestsHref } from "@/lib/dashboard"
import { parsePage } from "@/lib/pagination"
import type { RequestStatus } from "@/lib/types"

type RequestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
  // The role's list and its loading cards
  List: (props: { page: number; status?: RequestStatus }) => Promise<ReactNode>
  Skeleton: ComponentType
}

/*
Reads the URL, so it renders at request time. A new status shows the skeleton again; a
new page keeps the current cards until the next page swaps in, so nothing above moves.
*/
async function RequestsList({ searchParams, List, Skeleton }: RequestsPageProps) {
  const query = await searchParams
  const page = parsePage(query.page)
  const status = parseRequestStatus(query.status)

  return (
    <div className="flex flex-col gap-6">
      <RequestStatusFilter status={status} href={(option) => requestsHref(option)} />
      {/* A page change jumps here, to the first card */}
      <div id="requests" className="jump-target-4">
        <Suspense key={status} fallback={<Skeleton />}>
          <List page={page} status={status} />
        </Suspense>
      </div>
    </div>
  )
}

/*
The requests page as every role sees it: the heading, the status strip and the role's cards. The
proxy shows each role its own page at `/dashboard/requests`, so the first load's skeleton
matches the cards that arrive, status links' row included.
*/
export function RequestsPage(props: RequestsPageProps) {
  const { Skeleton } = props

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Requests</h1>
      <Suspense
        fallback={
          <div className="flex flex-col gap-6" aria-hidden="true">
            <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
            <Skeleton />
          </div>
        }
      >
        <RequestsList {...props} />
      </Suspense>
    </section>
  )
}

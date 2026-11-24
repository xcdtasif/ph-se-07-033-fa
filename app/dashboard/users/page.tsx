import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { parsePage } from "@/lib/pagination"

import { parseUserFilter, parseUserSearch, UserFilterStrip } from "./_components/user-filter"
import { UserSearch } from "./_components/user-search"
import { UsersTable, UsersTableSkeleton } from "./_components/users-table"

export const metadata: Metadata = {
  title: "Users",
}

/*
Reads the URL, so it renders at request time. A new search, filter or page keeps the current
rows, faded, until the next ones swap in (a transition), so nothing above them moves.
*/
async function UsersList({ searchParams }: Pick<PageProps<"/dashboard/users">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const filter = parseUserFilter(query.filter)
  const search = parseUserSearch(query.search)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <UserSearch filter={filter} search={search} />
        <UserFilterStrip filter={filter} search={search} />
      </div>
      {/* A page change jumps here, to the first row */}
      <div id="users" className="jump-target-4">
        <Suspense fallback={<UsersTableSkeleton />}>
          <UsersTable page={page} filter={filter} search={search} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the search box and the strip's row too, so the table doesn't move down
function UsersPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-4">
        <div className="skeleton h-8 w-full max-w-sm rounded-lg" />
        <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      </div>
      <UsersTableSkeleton />
    </div>
  )
}

export default function UsersPage({ searchParams }: PageProps<"/dashboard/users">) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Users" />
      <Suspense fallback={<UsersPageSkeleton />}>
        <UsersList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

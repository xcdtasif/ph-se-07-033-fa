import Link from "next/link"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { ClippedWords } from "@/components/shared/clipped-words"
import { Pagination, PaginationSkeleton } from "@/components/shared/pagination"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { authFetch } from "@/lib/auth-fetch"
import { formatShortDate } from "@/lib/format"
import type { User } from "@/lib/types"
import { cn } from "@/lib/utils"

import { BanButton } from "./ban-button"
import {
  userFilterLabel,
  usersHref,
  usersQuery,
  UserRoleBadge,
  UserStatusBadge,
  type UserFilter,
} from "./user-filter"

const USERS_PAGE_SIZE = 10

/*
The date, badge and button columns are fixed widths that fit the widest of each ("31-12-99",
"Landlord", "Banned", "Unban") with the cell's padding, so they never clip.
The name and email share what's left, three sevenths to the name and four sevenths to the
email: they span three and four columns, and a fixed-layout table splits what's left equally
between the columns without a width (calc() widths, e.g. three sevenths of what's left, are
ignored there).
*/
const NAME_SPAN = 3
const EMAIL_SPAN = 4

const COLUMNS = [
  { label: "Name", width: undefined, span: NAME_SPAN },
  { label: "Email", width: undefined, span: EMAIL_SPAN },
  { label: "Joined", width: "w-28", span: 1 },
  { label: "Role", width: "w-28", span: 1 },
  { label: "Status", width: "w-28", span: 1 },
  { label: "Action", width: "w-28", span: 1 },
]

/*
A bordered card around the table like the payments one: columns keep their widths (table-fixed)
down to 49rem: the four fixed columns' 28rem, 12rem for the email, room for a typical
20-character address, and 9rem for the name. A narrower screen scrolls sideways, and text too long for
its column ends in "…".
Every row is as tall as one with a button, so rows without one (admins) don't look squashed. No
header row on screen; screen readers still get the column names.
*/
function UsersFrame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table className="min-w-196 table-fixed [&_td]:h-11 [&_td]:truncate [&_td]:px-4">
        <colgroup>
          {COLUMNS.map(({ label, width, span }) => (
            <col key={label} span={span} className={width} />
          ))}
        </colgroup>
        <TableHeader className="sr-only">
          <TableRow>
            {COLUMNS.map(({ label, span }) => (
              <TableHead key={label} colSpan={span}>
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  )
}

export function UsersTableSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <UsersFrame>
        {Array.from({ length: USERS_PAGE_SIZE }, (_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell colSpan={NAME_SPAN}>
              <SkeletonText className="w-3/4" />
            </TableCell>
            <TableCell colSpan={EMAIL_SPAN}>
              <SkeletonText className="w-4/5" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-16" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-5 w-16 rounded-4xl" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-5 w-14 rounded-4xl" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-7 w-14 rounded-lg" />
            </TableCell>
          </TableRow>
        ))}
      </UsersFrame>
      <PaginationSkeleton />
    </div>
  )
}

type UsersTableProps = {
  page: number
  filter?: UserFilter
  search?: string
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function UsersTable({ page, filter, search }: UsersTableProps) {
  const query = usersQuery(filter, search)
  const result = await authFetch<User[]>(
    `/api/admin/users?page=${page}&limit=${USERS_PAGE_SIZE}${query ? `&${query}` : ""}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: users, meta } = result
  const total = meta?.total ?? users.length
  const totalPages = Math.max(1, Math.ceil(total / USERS_PAGE_SIZE))

  if (users.length === 0) {
    // Past the last page, nothing matching the search, or none with this filter
    return (
      <div className="empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no users on this page.</p>
            <Link
              href={usersHref({ filter, search })}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : search ? (
          <p>No users match your search.</p>
        ) : (
          <p>No {filter ? `${userFilterLabel(filter).toLowerCase()} ` : ""}users.</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <UsersFrame>
        {users.map((user) => (
          <TableRow key={user.id}>
            {/* A banned user's name is muted, like a hidden card's text */}
            <TableCell
              colSpan={NAME_SPAN}
              className={cn("font-medium", user.isBanned && "text-muted-foreground")}
              title={user.name}
            >
              <ClippedWords text={user.name} />
            </TableCell>
            <TableCell colSpan={EMAIL_SPAN} className="text-muted-foreground" title={user.email}>
              {user.email}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatShortDate(user.createdAt)}
            </TableCell>
            <TableCell>
              <UserRoleBadge role={user.role} />
            </TableCell>
            <TableCell>
              <UserStatusBadge isBanned={user.isBanned} />
            </TableCell>
            {/* Admins can't be banned; the button's focus ring needs room past the cell */}
            <TableCell className="overflow-visible!">
              {user.role !== "ADMIN" && (
                <BanButton userId={user.id} role={user.role} isBanned={user.isBanned} />
              )}
            </TableCell>
          </TableRow>
        ))}
      </UsersFrame>
      <Pagination
        label="Users pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => usersHref({ filter, search, page: target })}
        scrollTo="users"
      />
    </div>
  )
}

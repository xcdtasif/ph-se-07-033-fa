import { BANNED_COLORS, PILL_COLORS } from "@/components/shared/pill-colors"
import { StatusFilter } from "@/components/shared/status-filter"
import { Badge } from "@/components/ui/badge"
import { USER_ROLES, type UserRole } from "@/lib/types"

/*
A role shows that role's active users; BANNED shows the banned ones, whatever their role (only
tenants and landlords can be banned). All (undefined) shows everyone
*/
export type UserFilter = UserRole | "BANNED"

const USER_FILTERS: readonly UserFilter[] = [...USER_ROLES, "BANNED"]

const FILTERS: Record<UserFilter, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: PILL_COLORS.violet },
  LANDLORD: { label: "Landlord", className: PILL_COLORS.blue },
  TENANT: { label: "Tenant", className: PILL_COLORS.amber },
  BANNED: { label: "Banned", className: BANNED_COLORS },
}

export const userFilterLabel = (filter: UserFilter) => FILTERS[filter].label

// `?filter=` as a user filter, undefined (all) for anything else
export const parseUserFilter = (value: string | string[] | undefined) =>
  USER_FILTERS.find((filter) => filter === value)

// The backend's query for a filter and search: banned ones by themselves, a role without them
export const usersQuery = (filter?: UserFilter, search?: string) => {
  const query = new URLSearchParams()

  if (filter === "BANNED") {
    query.set("isBanned", "true")
  } else if (filter) {
    query.set("role", filter)
    query.set("isBanned", "false")
  }

  if (search) {
    query.set("search", search)
  }

  return query.toString()
}

// This page's URL, leaving defaults out of the query; a new filter or search starts from page 1
export const usersHref = ({
  filter,
  search,
  page = 1,
}: {
  filter?: UserFilter
  search?: string
  page?: number
}) => {
  const query = new URLSearchParams()

  if (filter) {
    query.set("filter", filter)
  }

  if (search) {
    query.set("search", search)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const text = query.toString()

  return text ? `/dashboard/users?${text}` : "/dashboard/users"
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  const { label, className } = FILTERS[role]

  return <Badge className={className}>{label}</Badge>
}

// Banned in the strip's colours, or active in green
export function UserStatusBadge({ isBanned }: { isBanned: boolean }) {
  return isBanned ? (
    <Badge className={FILTERS.BANNED.className}>Banned</Badge>
  ) : (
    <Badge className={PILL_COLORS.emerald}>Active</Badge>
  )
}

type UserFilterStripProps = {
  filter?: UserFilter
  // The search stays as the filter changes
  search?: string
}

export function UserFilterStrip({ filter, search }: UserFilterStripProps) {
  return (
    <StatusFilter
      label="Filter users by role"
      statuses={USER_FILTERS}
      status={filter}
      href={(option) => usersHref({ filter: option, search })}
      statusLabel={userFilterLabel}
      statusColors={(option) => FILTERS[option].className}
      listId="users"
    />
  )
}

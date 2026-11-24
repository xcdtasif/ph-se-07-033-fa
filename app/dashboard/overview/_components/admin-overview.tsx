import { Building2, Clock, Users } from "lucide-react"

import { ApiError } from "@/components/shared/api-error"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref } from "@/lib/dashboard"
import type { AdminRequest, Property, User } from "@/lib/types"

import { StatCards, totalOf, type Stat } from "./stat-cards"

type StatKey = "users" | "properties" | "pending"

// The platform's health at a glance; a card opens its list once that page exists
const STATS: Stat<StatKey>[] = [
  {
    key: "users",
    label: "Users",
    icon: Users,
    note: "Tenants, landlords and admins, banned ones included",
    href: "/dashboard/users",
  },
  {
    key: "properties",
    label: "Properties",
    icon: Building2,
    note: "All listings, in any status, hidden ones included",
  },
  {
    key: "pending",
    label: "Pending requests",
    icon: Clock,
    note: "Waiting for a landlord to approve or reject",
    href: requestsHref("PENDING"),
  },
]

export function AdminOverviewSkeleton() {
  const figure = <SkeletonText className="w-24" />

  return (
    <div aria-hidden="true">
      <StatCards stats={STATS} values={{ users: figure, properties: figure, pending: figure }} />
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function AdminOverview() {
  const [users, properties, pending] = await Promise.all([
    authFetch<User[]>("/api/admin/users?limit=1"),
    authFetch<Property[]>("/api/admin/properties?limit=1"),
    authFetch<AdminRequest[]>("/api/admin/requests?limit=1&status=PENDING"),
  ])

  if (!users.success) {
    return <ApiError error={users} />
  }

  if (!properties.success) {
    return <ApiError error={properties} />
  }

  if (!pending.success) {
    return <ApiError error={pending} />
  }

  return (
    <StatCards
      stats={STATS}
      values={{
        users: totalOf(users),
        properties: totalOf(properties),
        pending: totalOf(pending),
      }}
    />
  )
}

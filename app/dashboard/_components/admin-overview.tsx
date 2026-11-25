import {
  Building2,
  Clock,
  Eye,
  EyeOff,
  Inbox,
  KeyRound,
  Star,
  UserCheck,
  UserX,
  Users,
} from "lucide-react"
import type { ReactNode } from "react"

import { usersHref } from "@/app/dashboard/users/_components/user-filter"
import { ApiError } from "@/components/shared/api-error"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { authFetch } from "@/lib/auth-fetch"
import { propertiesHref, requestsHref, reviewsHref } from "@/lib/dashboard"

import { StatCards, totalOf, type Stat } from "./stat-cards"

type StatKey =
  | "users"
  | "activeUsers"
  | "bannedUsers"
  | "properties"
  | "visibleProperties"
  | "hiddenProperties"
  | "reviews"
  | "visibleReviews"
  | "hiddenReviews"
  | "requests"
  | "pending"
  | "active"

/*
The platform's health at a glance: a section per list, its total first, then how it splits.
Each card opens its list at that filter; Active users and Visible properties have no filter of
their own, so they don't open anything
*/
const SECTIONS: { title: string; stats: Stat<StatKey>[] }[] = [
  {
    title: "Users",
    stats: [
      {
        key: "users",
        label: "All",
        icon: Users,
        note: "Admins, landlords and tenants",
        href: "/dashboard/users",
      },
      {
        key: "activeUsers",
        label: "Active",
        icon: UserCheck,
        note: "Not banned, so they can log in",
      },
      {
        key: "bannedUsers",
        label: "Banned",
        icon: UserX,
        note: "Locked out until they're unbanned",
        href: usersHref({ filter: "BANNED" }),
      },
    ],
  },
  {
    title: "Properties",
    stats: [
      {
        key: "properties",
        label: "All",
        icon: Building2,
        note: "Every listing, in any status",
        href: propertiesHref(),
      },
      {
        key: "visibleProperties",
        label: "Visible",
        icon: Eye,
        note: "Not hidden and the landlord isn't banned",
      },
      {
        key: "hiddenProperties",
        label: "Hidden",
        icon: EyeOff,
        note: "Hidden by an admin, in any status",
        href: propertiesHref({ filter: "HIDDEN" }),
      },
    ],
  },
  {
    title: "Requests",
    stats: [
      {
        key: "requests",
        label: "All",
        icon: Inbox,
        note: "Every rental request, in any status",
        href: requestsHref(),
      },
      {
        key: "pending",
        label: "Pending",
        icon: Clock,
        note: "Waiting for a landlord to approve or reject",
        href: requestsHref("PENDING"),
      },
      {
        key: "active",
        label: "Active",
        icon: KeyRound,
        note: "Deposit paid, tenant moved in",
        href: requestsHref("ACTIVE"),
      },
    ],
  },
  {
    title: "Reviews",
    stats: [
      {
        key: "reviews",
        label: "All",
        icon: Star,
        note: "Every review, hidden ones included",
        href: reviewsHref(),
      },
      {
        key: "visibleReviews",
        label: "Visible",
        icon: Eye,
        note: "Shown on the property and in its rating",
        href: reviewsHref({ filter: "VISIBLE" }),
      },
      {
        key: "hiddenReviews",
        label: "Hidden",
        icon: EyeOff,
        note: "Left out of the property's reviews",
        href: reviewsHref({ filter: "HIDDEN" }),
      },
    ],
  },
]

// Each section under its heading
function Overview({ values }: { values: Record<StatKey, ReactNode> }) {
  return (
    <div className="flex flex-col gap-10">
      {SECTIONS.map(({ title, stats }) => (
        <section key={title} className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <StatCards stats={stats} values={values} />
        </section>
      ))}
    </div>
  )
}

export function AdminOverviewSkeleton() {
  const figure = <SkeletonText className="w-24" />
  const values = Object.fromEntries(
    SECTIONS.flatMap(({ stats }) => stats.map(({ key }) => [key, figure])),
  ) as Record<StatKey, ReactNode>

  return (
    <div aria-hidden="true">
      <Overview values={values} />
    </div>
  )
}

// A list's total, from a page of one
const countOf = (path: string) =>
  authFetch<unknown[]>(`${path}${path.includes("?") ? "&" : "?"}limit=1`)

/*
Per-user, uncached: reads cookies, so it sits inside <Suspense>. Active users and visible reviews
are the rest of the total, since a user is banned or not and a review hidden or not; a visible
property is neither hidden nor its landlord's banned, so it's counted on its own
*/
export async function AdminOverview() {
  const results = await Promise.all([
    countOf("/api/admin/users"),
    countOf("/api/admin/users?isBanned=true"),
    countOf("/api/admin/properties"),
    countOf("/api/admin/properties?isHidden=false&isLandlordBanned=false"),
    countOf("/api/admin/properties?isHidden=true"),
    countOf("/api/admin/reviews"),
    countOf("/api/admin/reviews?isHidden=true"),
    countOf("/api/admin/requests"),
    countOf("/api/admin/requests?status=PENDING"),
    countOf("/api/admin/requests?status=ACTIVE"),
  ])

  const failed = results.find((result) => !result.success)

  if (failed && !failed.success) {
    return <ApiError error={failed} />
  }

  const [
    users,
    bannedUsers,
    properties,
    visibleProperties,
    hiddenProperties,
    reviews,
    hiddenReviews,
    requests,
    pending,
    active,
  ] = results.map((result) => (result.success ? totalOf(result) : 0))

  return (
    <Overview
      values={{
        users,
        activeUsers: users - bannedUsers,
        bannedUsers,
        properties,
        visibleProperties,
        hiddenProperties,
        reviews,
        visibleReviews: reviews - hiddenReviews,
        hiddenReviews,
        requests,
        pending,
        active,
      }}
    />
  )
}

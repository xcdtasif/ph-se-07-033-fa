import { Building2, CircleCheck, Clock, KeyRound, Star, Wallet } from "lucide-react"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { SkeletonText } from "@/components/shared/skeleton-text"
import type { ApiResponse } from "@/lib/api"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref } from "@/lib/dashboard"
import { formatMoney } from "@/lib/format"
import type { LandlordRequest, LandlordReview, Property, RequestStatus } from "@/lib/types"

import { StatCards, totalOf, type Stat } from "./stat-cards"

// The backend's largest page
const MAX_LIMIT = 50

// Every request in a status, a page at a time, since the backend has no totals endpoint
async function fetchAllRequests(status: RequestStatus): Promise<ApiResponse<LandlordRequest[]>> {
  const requests: LandlordRequest[] = []

  for (let page = 1; ; page++) {
    const result = await authFetch<LandlordRequest[]>(
      `/api/landlord/requests?page=${page}&limit=${MAX_LIMIT}&status=${status}`,
    )

    if (!result.success) {
      return result
    }

    requests.push(...result.data)

    if (result.data.length < MAX_LIMIT || requests.length >= (result.meta?.total ?? 0)) {
      return { ...result, data: requests }
    }
  }
}

type StatKey = "properties" | "earnings" | "reviews" | "pending" | "approved" | "active"

// The listings, which open the properties page, and what they've brought in
const PROPERTIES: Stat<StatKey>[] = [
  {
    key: "properties",
    label: "All",
    icon: Building2,
    note: "All your listings, in any status",
    href: "/dashboard/properties",
  },
  {
    key: "earnings",
    label: "Earnings",
    icon: Wallet,
    note: "Deposits from active and completed requests",
  },
  {
    key: "reviews",
    label: "Reviews",
    icon: Star,
    note: "Visible reviews of your properties",
  },
]

// The requests that still need something, each opening the requests page at its status
const REQUESTS: Stat<StatKey>[] = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    note: "Waiting for you to approve or reject",
    href: requestsHref("PENDING"),
  },
  {
    key: "approved",
    label: "Approved",
    icon: CircleCheck,
    note: "Waiting for the tenant's deposit",
    href: requestsHref("APPROVED"),
  },
  {
    key: "active",
    label: "Active",
    icon: KeyRound,
    note: "Deposit paid, tenant moved in",
    href: requestsHref("ACTIVE"),
  },
]

const SECTIONS = [
  { title: "Properties", stats: PROPERTIES },
  { title: "Requests", stats: REQUESTS },
]

// Each row of cards under its own heading, like the admin's
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

export function LandlordOverviewSkeleton() {
  const figure = <SkeletonText className="w-24" />

  return (
    <div aria-hidden="true">
      <Overview
        values={{
          properties: figure,
          earnings: figure,
          reviews: figure,
          pending: figure,
          approved: figure,
          active: figure,
        }}
      />
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function LandlordOverview() {
  const [properties, reviews, pending, approved, active, completed] = await Promise.all([
    authFetch<Property[]>("/api/landlord/properties?limit=1"),
    authFetch<LandlordReview[]>("/api/landlord/reviews?limit=1"),
    authFetch<LandlordRequest[]>("/api/landlord/requests?limit=1&status=PENDING"),
    authFetch<LandlordRequest[]>("/api/landlord/requests?limit=1&status=APPROVED"),
    fetchAllRequests("ACTIVE"),
    fetchAllRequests("COMPLETED"),
  ])

  if (!properties.success) {
    return <ApiError error={properties} />
  }

  if (!reviews.success) {
    return <ApiError error={reviews} />
  }

  if (!pending.success) {
    return <ApiError error={pending} />
  }

  if (!approved.success) {
    return <ApiError error={approved} />
  }

  if (!active.success) {
    return <ApiError error={active} />
  }

  if (!completed.success) {
    return <ApiError error={completed} />
  }

  const earnings = [...active.data, ...completed.data].reduce(
    (sum, request) => sum + Number(request.paidDeposit ?? 0),
    0,
  )

  return (
    <Overview
      values={{
        properties: totalOf(properties),
        earnings: formatMoney(earnings.toFixed(2)),
        reviews: totalOf(reviews),
        pending: totalOf(pending),
        approved: totalOf(approved),
        active: active.data.length,
      }}
    />
  )
}

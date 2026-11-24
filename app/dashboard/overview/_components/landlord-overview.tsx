import {
  Building2,
  CircleCheck,
  Clock,
  KeyRound,
  Star,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { SkeletonText } from "@/components/shared/skeleton-text"
import type { ApiResponse } from "@/lib/api"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref } from "@/lib/dashboard"
import { formatMoney } from "@/lib/format"
import type { LandlordRequest, LandlordReview, Property, RequestStatus } from "@/lib/types"

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

type Stat = { key: StatKey; label: string; icon: LucideIcon; note: string; href?: string }

const TOTALS: Stat[] = [
  {
    key: "properties",
    label: "Properties",
    icon: Building2,
    note: "All your listings, in any status",
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
const REQUESTS: Stat[] = [
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

// The label and icon on top, the figure, then what it counts
function StatContent({ stat, value }: { stat: Stat; value: ReactNode }) {
  const Icon = stat.icon

  return (
    <>
      <p className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
        {stat.label}
        <Icon className="size-4 shrink-0" aria-hidden="true" />
      </p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-muted-foreground text-xs">{stat.note}</p>
    </>
  )
}

// One card per stat, each with its figure; a stat with a link is a card you can open
function StatCards({ stats, values }: { stats: Stat[]; values: Record<StatKey, ReactNode> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <li key={stat.key} className="flex">
          {stat.href ? (
            <Link
              href={stat.href}
              className="bg-card focus-visible:ring-ring/50 flex flex-1 flex-col gap-1 rounded-xl border p-4 outline-none hover:brightness-97 focus-visible:ring-3"
            >
              <StatContent stat={stat} value={values[stat.key]} />
            </Link>
          ) : (
            <div className="bg-card flex flex-1 flex-col gap-1 rounded-xl border p-4">
              <StatContent stat={stat} value={values[stat.key]} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// The totals, then the requests under their own heading
function Overview({ values }: { values: Record<StatKey, ReactNode> }) {
  return (
    <div className="flex flex-col gap-10">
      <StatCards stats={TOTALS} values={values} />
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Requests</h2>
        <StatCards stats={REQUESTS} values={values} />
      </section>
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

// A list's total from its first page of one
const totalOf = <T,>(result: { data: T[]; meta?: { total: number } }) =>
  result.meta?.total ?? result.data.length

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

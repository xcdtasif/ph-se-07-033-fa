import { Building2, KeyRound, Wallet, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { SkeletonText } from "@/components/shared/skeleton-text"
import type { ApiResponse } from "@/lib/api"
import { authFetch } from "@/lib/auth-fetch"
import { formatMoney } from "@/lib/format"
import type { LandlordRequest, Property, RequestStatus } from "@/lib/types"

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

type StatKey = "properties" | "active" | "earnings"

const STATS: { key: StatKey; label: string; icon: LucideIcon; note: string }[] = [
  {
    key: "properties",
    label: "Properties",
    icon: Building2,
    note: "All your listings, in any status",
  },
  {
    key: "active",
    label: "Active requests",
    icon: KeyRound,
    note: "Deposit paid, tenant moved in",
  },
  {
    key: "earnings",
    label: "Earnings",
    icon: Wallet,
    note: "Deposits from active and completed requests",
  },
]

// One card per stat, each with its figure
function StatCards({ values }: { values: Record<StatKey, ReactNode> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {STATS.map(({ key, label, icon: Icon, note }) => (
        // The label and icon on top, the figure, then what it counts
        <li key={key} className="bg-card flex flex-col gap-1 rounded-xl border p-4">
          <p className="text-muted-foreground flex items-center justify-between gap-2 text-sm">
            {label}
            <Icon className="size-4 shrink-0" aria-hidden="true" />
          </p>
          <p className="text-2xl font-semibold tracking-tight">{values[key]}</p>
          <p className="text-muted-foreground text-xs">{note}</p>
        </li>
      ))}
    </ul>
  )
}

export function LandlordOverviewSkeleton() {
  const figure = <SkeletonText className="w-24" />

  return (
    <div aria-hidden="true">
      <StatCards values={{ properties: figure, active: figure, earnings: figure }} />
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function LandlordOverview() {
  const [properties, active, completed] = await Promise.all([
    authFetch<Property[]>("/api/landlord/properties?limit=1"),
    fetchAllRequests("ACTIVE"),
    fetchAllRequests("COMPLETED"),
  ])

  if (!properties.success) {
    return <ApiError error={properties} />
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
    <StatCards
      values={{
        properties: properties.meta?.total ?? properties.data.length,
        active: active.data.length,
        earnings: formatMoney(earnings.toFixed(2)),
      }}
    />
  )
}

import { CircleCheck, Clock, Flag } from "lucide-react"
import type { ReactNode } from "react"

import { ApiError } from "@/components/shared/api-error"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref } from "@/lib/dashboard"
import type { RentalRequest } from "@/lib/types"

import { StatCards, totalOf, type Stat } from "./stat-cards"

type StatKey = "pending" | "approved" | "completed"

// The tenant's requests by status, each opening the requests page at that status
const REQUESTS: Stat<StatKey>[] = [
  {
    key: "pending",
    label: "Pending",
    icon: Clock,
    note: "Waiting for the landlord to approve",
    href: requestsHref("PENDING"),
  },
  {
    key: "approved",
    label: "Approved",
    icon: CircleCheck,
    note: "Waiting for you to pay the deposit",
    href: requestsHref("APPROVED"),
  },
  {
    key: "completed",
    label: "Completed",
    icon: Flag,
    note: "Finished rentals, ready for a review",
    href: requestsHref("COMPLETED"),
  },
]

// The request counts in one row under a heading, like the landlord's Requests section
function Overview({ values }: { values: Record<StatKey, ReactNode> }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">Requests</h2>
      <StatCards stats={REQUESTS} values={values} />
    </section>
  )
}

export function TenantOverviewSkeleton() {
  const figure = <SkeletonText className="w-24" />

  return (
    <div aria-hidden="true">
      <Overview values={{ pending: figure, approved: figure, completed: figure }} />
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function TenantOverview() {
  const [pending, approved, completed] = await Promise.all([
    authFetch<RentalRequest[]>("/api/tenant/requests?limit=1&status=PENDING"),
    authFetch<RentalRequest[]>("/api/tenant/requests?limit=1&status=APPROVED"),
    authFetch<RentalRequest[]>("/api/tenant/requests?limit=1&status=COMPLETED"),
  ])

  if (!pending.success) {
    return <ApiError error={pending} />
  }

  if (!approved.success) {
    return <ApiError error={approved} />
  }

  if (!completed.success) {
    return <ApiError error={completed} />
  }

  return (
    <Overview
      values={{
        pending: totalOf(pending),
        approved: totalOf(approved),
        completed: totalOf(completed),
      }}
    />
  )
}

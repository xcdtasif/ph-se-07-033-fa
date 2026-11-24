import { REQUEST_STATUSES, type RequestStatus } from "@/lib/types"

import { requestStatusColors, requestStatusLabel } from "./request-status-badge"
import { StatusFilter } from "./status-filter"

// `?status=` as a request status, undefined (all) for anything else
export const parseRequestStatus = (value: string | string[] | undefined) =>
  REQUEST_STATUSES.find((status) => status === value)

type RequestStatusFilterProps = {
  status?: RequestStatus
  href: (status?: RequestStatus) => string
  showAll?: boolean
}

export function RequestStatusFilter({ status, href, showAll }: RequestStatusFilterProps) {
  return (
    <StatusFilter
      label="Filter requests by status"
      statuses={REQUEST_STATUSES}
      status={status}
      href={href}
      statusLabel={requestStatusLabel}
      statusColors={requestStatusColors}
      showAll={showAll}
    />
  )
}

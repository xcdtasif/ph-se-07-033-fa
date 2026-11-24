import { StatusFilter } from "@/components/shared/status-filter"
import { Badge } from "@/components/ui/badge"
import { PAYMENT_STATUSES, type PaymentStatus } from "@/lib/types"

// Completed means paid, so it's green
const STATUSES: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  COMPLETED: { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-800" },
}

export const paymentStatusLabel = (status: PaymentStatus) => STATUSES[status].label

// `?status=` as a payment status, undefined (all) for anything else
export const parsePaymentStatus = (value: string | string[] | undefined) =>
  PAYMENT_STATUSES.find((status) => status === value)

// This page's URL for a status and page, leaving defaults out of the query
export const paymentsHref = (status?: PaymentStatus, page = 1) => {
  const query = new URLSearchParams()

  if (status) {
    query.set("status", status)
  }

  if (page > 1) {
    query.set("page", String(page))
  }

  const text = query.toString()

  return text ? `/dashboard/payments?${text}` : "/dashboard/payments"
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, className } = STATUSES[status]

  return <Badge className={className}>{label}</Badge>
}

export function PaymentStatusFilter({ status }: { status?: PaymentStatus }) {
  return (
    <StatusFilter
      label="Filter payments by status"
      statuses={PAYMENT_STATUSES}
      status={status}
      href={(option) => paymentsHref(option)}
      statusLabel={paymentStatusLabel}
      statusColors={(option) => STATUSES[option].className}
      listId="payments"
    />
  )
}

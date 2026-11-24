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
import { requestsHref } from "@/lib/dashboard"
import { formatAmount, formatShortDateTime } from "@/lib/format"
import type { Payment, PaymentStatus, PaymentType } from "@/lib/types"

import { paymentsHref, paymentStatusLabel, PaymentStatusBadge } from "./payment-status"

const PAYMENTS_PAGE_SIZE = 10

const TYPES: Record<PaymentType, string> = {
  DEPOSIT: "Deposit",
}

/*
Like the users table: every column but the property is a fixed width that fits the widest of
each ("31-12-99 23:59", "9,99,999.99", "BDT", "Deposit", "Completed") with the cell's padding,
so it never clips; the property takes what's left.
*/
const COLUMNS = [
  { label: "Date", width: "w-40" },
  { label: "Property", width: undefined },
  { label: "Amount", width: "w-32" },
  { label: "Currency", width: "w-20" },
  { label: "Type", width: "w-24" },
  { label: "Status", width: "w-32" },
]

/*
A bordered card around the table, with more room at the row ends than the default cells.
The columns keep their widths (table-fixed) down to 50rem: the fixed columns' 37rem and 13rem for
the property. A narrower screen scrolls the table sideways (see Table). Nothing wraps: text too
long for its column ends in "…". No header row on screen; screen readers still get the
column names.
*/
function PaymentsFrame({ children }: { children: ReactNode }) {
  return (
    <div className="bg-card overflow-hidden rounded-xl border">
      <Table className="min-w-200 table-fixed [&_td]:truncate [&_td]:px-4">
        <colgroup>
          {COLUMNS.map(({ label, width }) => (
            <col key={label} className={width} />
          ))}
        </colgroup>
        <TableHeader className="sr-only">
          <TableRow>
            {COLUMNS.map(({ label }) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  )
}

export function TenantPaymentsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <PaymentsFrame>
        {Array.from({ length: PAYMENTS_PAGE_SIZE }, (_, index) => (
          <TableRow key={index} className="hover:bg-transparent">
            <TableCell>
              <SkeletonText className="w-24" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-3/4" />
            </TableCell>
            <TableCell>
              <SkeletonText className="ml-auto w-16" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-8" />
            </TableCell>
            <TableCell>
              <SkeletonText className="w-14" />
            </TableCell>
            <TableCell>
              <div className="skeleton h-5 w-20 rounded-4xl" />
            </TableCell>
          </TableRow>
        ))}
      </PaymentsFrame>
      <PaginationSkeleton />
    </div>
  )
}

// Per-user, uncached: reads cookies, so it sits inside <Suspense>
export async function TenantPayments({ page, status }: { page: number; status?: PaymentStatus }) {
  const result = await authFetch<Payment[]>(
    `/api/tenant/payments?page=${page}&limit=${PAYMENTS_PAGE_SIZE}${status ? `&status=${status}` : ""}`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const { data: payments, meta } = result
  const total = meta?.total ?? payments.length
  const totalPages = Math.max(1, Math.ceil(total / PAYMENTS_PAGE_SIZE))

  if (payments.length === 0) {
    // Past the last page, none with this status, or no payments at all
    return (
      <div className="text-muted-foreground empty-state flex flex-col items-center gap-4">
        {total > 0 ? (
          <>
            <p>There are no payments on this page.</p>
            <Link
              href={paymentsHref(status)}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              Go to the first page
            </Link>
          </>
        ) : status ? (
          <p>No {paymentStatusLabel(status).toLowerCase()} payments.</p>
        ) : (
          <>
            <p>No payments.</p>
            <Link
              href={requestsHref("APPROVED")}
              className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
            >
              View approved requests
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PaymentsFrame>
        {payments.map((payment) => {
          const { property } = payment.request
          return (
            <TableRow key={payment.id}>
              <TableCell className="text-muted-foreground tabular-nums">
                {formatShortDateTime(payment.createdAt)}
              </TableCell>
              <TableCell className="font-medium">
                {/* Ends after the last word that fits, a first word too long cut midway */}
                <Link href={`/properties/${property.id}`} title={property.name} className="group">
                  <ClippedWords text={property.name} underline />
                </Link>
              </TableCell>
              {/* Right-aligned so the digits line up, next to the currency */}
              <TableCell className="text-right tabular-nums">
                {formatAmount(payment.amount)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {payment.currency.toUpperCase()}
              </TableCell>
              <TableCell>{TYPES[payment.type]}</TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
            </TableRow>
          )
        })}
      </PaymentsFrame>
      <Pagination
        label="Payments pagination"
        page={page}
        totalPages={totalPages}
        href={(target) => paymentsHref(status, target)}
        scrollTo="payments"
      />
    </div>
  )
}

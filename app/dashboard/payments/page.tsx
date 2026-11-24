import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { parsePage } from "@/lib/pagination"

import { parsePaymentStatus, PaymentStatusFilter } from "./_components/payment-status"
import { TenantPayments, TenantPaymentsSkeleton } from "./_components/tenant-payments"

export const metadata: Metadata = {
  title: "Payments",
}

/*
Reads the URL, so it renders at request time. A new status or page keeps the current rows,
faded, until the next ones swap in (a transition), so nothing above them moves.
*/
async function PaymentsList({
  searchParams,
}: Pick<PageProps<"/dashboard/payments">, "searchParams">) {
  const query = await searchParams
  const page = parsePage(query.page)
  const status = parsePaymentStatus(query.status)

  return (
    <div className="flex flex-col gap-6">
      <PaymentStatusFilter status={status} />
      {/* A page change jumps here, to the top of the table */}
      <div id="payments" className="jump-target-4">
        <Suspense fallback={<TenantPaymentsSkeleton />}>
          <TenantPayments page={page} status={status} />
        </Suspense>
      </div>
    </div>
  )
}

// The first load: the status links' row too, so the table doesn't move down when it arrives
function PaymentsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="skeleton h-9 w-full max-w-xl rounded-lg" />
      <TenantPaymentsSkeleton />
    </div>
  )
}

export default function PaymentsPage({ searchParams }: PageProps<"/dashboard/payments">) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Payments" />
      <Suspense fallback={<PaymentsPageSkeleton />}>
        <PaymentsList searchParams={searchParams} />
      </Suspense>
    </section>
  )
}

import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { parsePage } from "@/lib/pagination"

import { TenantPayments, TenantPaymentsSkeleton } from "./_components/tenant-payments"

export const metadata: Metadata = {
  title: "Payments",
}

/*
Reads the URL, so it renders at request time. A new page keeps the current rows until the
next page swaps in.
*/
async function PaymentsTable({
  searchParams,
}: Pick<PageProps<"/dashboard/payments">, "searchParams">) {
  return <TenantPayments page={parsePage((await searchParams).page)} />
}

export default function PaymentsPage({ searchParams }: PageProps<"/dashboard/payments">) {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Payments" />
      {/* A page change jumps here, to the top of the table */}
      <div id="payments" className="jump-target-4">
        <Suspense fallback={<TenantPaymentsSkeleton />}>
          <PaymentsTable searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  )
}

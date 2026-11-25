import { CircleAlert, CircleCheck, CircleX, LoaderCircle } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { ApiError } from "@/components/shared/api-error"
import { PageHeader } from "@/components/shared/page-header"
import { SkeletonText } from "@/components/shared/skeleton-text"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { authFetch } from "@/lib/auth-fetch"
import { requestsHref } from "@/lib/dashboard"
import { formatMoney } from "@/lib/format"
import type { Payment } from "@/lib/types"

import { PaymentNote, PaymentOutcome } from "../_components/payment-outcome"
import { PaymentPoller } from "./_components/payment-poller"

export const metadata: Metadata = {
  title: "Payment",
}

const actionClassName = buttonVariants({ size: "sm", className: "text-sm" })

// What was paid for: the property, the amount, and what kind of payment it was
function PaymentDetails({ payment }: { payment: Payment }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-base font-medium">{payment.request.property.name}</p>
      <p className="text-2xl font-semibold">{formatMoney(payment.amount)}</p>
      <p className="text-muted-foreground">Deposit</p>
    </div>
  )
}

// A missing or unknown session_id, e.g. a typed or shortened link
function PaymentNotFound() {
  return (
    <PaymentOutcome
      icon={CircleAlert}
      iconClassName="text-muted-foreground"
      title="Payment not found"
      action={
        <Link href={requestsHref()} className={actionClassName}>
          View requests
        </Link>
      }
    >
      <PaymentNote>We couldn&apos;t find a payment matching this ID.</PaymentNote>
    </PaymentOutcome>
  )
}

/*
Stripe sends the tenant here as soon as they pay, but only the webhook changes the
payment's status, so it may still be PENDING on arrival
*/
async function PaymentResult({
  searchParams,
}: Pick<PageProps<"/payments/success">, "searchParams">) {
  const { session_id: sessionId } = await searchParams

  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    return <PaymentNotFound />
  }

  // Only the tenant's own payments, so someone else's session finds nothing
  const result = await authFetch<Payment[]>(
    `/api/tenant/payments?sessionId=${encodeURIComponent(sessionId)}&limit=1`,
  )

  if (!result.success) {
    return <ApiError error={result} />
  }

  const payment = result.data[0]

  if (!payment) {
    return <PaymentNotFound />
  }

  if (payment.status === "PENDING") {
    return (
      <PaymentOutcome
        icon={LoaderCircle}
        iconClassName="text-muted-foreground animate-spin"
        title="Confirming your payment"
        action={<PaymentPoller />}
      >
        <PaymentDetails payment={payment} />
        <PaymentNote>Stripe usually confirms within a few seconds.</PaymentNote>
      </PaymentOutcome>
    )
  }

  // Only an unpaid checkout fails, so this is an old link to one that expired
  if (payment.status === "FAILED") {
    return (
      <PaymentOutcome
        icon={CircleX}
        iconClassName="text-red-600 dark:text-red-400"
        title="Payment not completed"
        action={
          <Link href={`/properties/${payment.request.property.id}`} className={actionClassName}>
            View property
          </Link>
        }
      >
        <PaymentDetails payment={payment} />
        <PaymentNote>The checkout expired, so you weren&apos;t charged.</PaymentNote>
      </PaymentOutcome>
    )
  }

  return (
    <PaymentOutcome
      icon={CircleCheck}
      iconClassName="text-emerald-600 dark:text-emerald-400"
      title="Payment successful"
      action={
        <Link href={requestsHref("ACTIVE")} className={actionClassName}>
          View active requests
        </Link>
      }
    >
      <PaymentDetails payment={payment} />
    </PaymentOutcome>
  )
}

// The successful card while the payment loads: icon, heading, the three details and the button
function PaymentResultSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardContent className="flex flex-col items-center gap-4 pt-4">
        <div className="skeleton size-10 rounded-full" />
        <SkeletonText className="w-44 text-lg" />
        <div className="flex w-full flex-col items-center gap-1">
          <SkeletonText className="w-56 text-base" />
          <SkeletonText className="w-36 text-2xl" />
          <SkeletonText className="w-16" />
        </div>
        <div className="divider-dashed mt-2 flex w-full justify-center pt-4">
          <div className="skeleton h-7 w-36 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function PaymentSuccessPage({ searchParams }: PageProps<"/payments/success">) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <PageHeader title="Payment" />
      {/* Screen readers hear the new status when polling swaps the card */}
      <div aria-live="polite">
        <Suspense fallback={<PaymentResultSkeleton />}>
          <PaymentResult searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  )
}

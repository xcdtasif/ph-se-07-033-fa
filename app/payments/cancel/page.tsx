import { CircleSlash } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { requestsHref } from "@/app/dashboard/requests/_components/tenant-requests"
import { buttonVariants } from "@/components/ui/button"

import { PaymentNote, PaymentOutcome } from "../_components/payment-outcome"

export const metadata: Metadata = {
  title: "Payment",
}

/*
Stripe sends the tenant here from the checkout's back link. The checkout stays open,
and paying the deposit again returns to it until it expires.
*/
export default function PaymentCancelPage() {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Payment</h1>
      <PaymentOutcome
        icon={CircleSlash}
        iconClassName="text-muted-foreground"
        title="Payment cancelled"
        action={
          <Link
            href={requestsHref("APPROVED")}
            className={buttonVariants({ size: "sm", className: "text-sm" })}
          >
            View approved requests
          </Link>
        }
      >
        <PaymentNote>You weren&apos;t charged. The checkout stays open for 35 minutes.</PaymentNote>
      </PaymentOutcome>
    </section>
  )
}

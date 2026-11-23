"use client"

import { Button } from "@/components/ui/button"
import { useFormAction } from "@/hooks/use-form-action"

import { payDepositAction } from "../_actions/payment-actions"

// On success the action leaves for Stripe, so only failures show a toast
export function PayDepositButton({ requestId }: { requestId: string }) {
  const [, formAction, pending] = useFormAction(() => payDepositAction(requestId))

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" className="text-sm" disabled={pending}>
        {pending ? "Redirecting…" : "Pay deposit"}
      </Button>
    </form>
  )
}

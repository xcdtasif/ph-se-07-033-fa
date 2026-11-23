"use server"

import { refresh } from "next/cache"
import { redirect } from "next/navigation"

import { authFetch } from "@/lib/auth-fetch"
import { toFormError, type FormState } from "@/lib/form"

/*
Starts a Stripe Checkout for an approved request's deposit and sends the tenant there.
While a checkout is open the backend returns the same URL, so a retry or a double
click doesn't start a second one. Only a failure comes back to the button
*/
export const payDepositAction = async (requestId: string): Promise<FormState<never>> => {
  const result = await authFetch<{ checkoutUrl: string }>("/api/tenant/payments/create", {
    method: "POST",
    body: { requestId },
  })

  if (!result.success) {
    // A 409 means the request or its property changed, so show their current state
    if (result.statusCode === 409) {
      refresh()
    }

    // 429, 502 and 503 messages already say to try again
    return toFormError(result)
  }

  redirect(result.data.checkoutUrl)
}

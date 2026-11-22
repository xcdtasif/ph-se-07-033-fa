"use server"

import { refresh } from "next/cache"

import { authFetch } from "@/lib/auth-fetch"
import { toFormError, type FormState } from "@/lib/form"
import type { RentalRequest } from "@/lib/types"

/*
The backend checks that the request is the tenant's own and still PENDING or
APPROVED; its 409 messages (already changed, checkout in progress) become toasts
*/
export const cancelRequestAction = async (requestId: string): Promise<FormState<never>> => {
  const result = await authFetch<RentalRequest>(
    `/api/tenant/requests/${encodeURIComponent(requestId)}`,
    { method: "PATCH", body: { status: "CANCELLED" } },
  )

  // Success shows the new status; a 409 means the list is stale, so show the current one
  if (result.success || result.statusCode === 409) {
    refresh()
  }

  if (!result.success) {
    return toFormError(result)
  }

  return { success: true, message: result.message }
}

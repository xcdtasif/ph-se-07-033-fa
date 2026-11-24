"use server"

import { refresh } from "next/cache"

import { authFetch } from "@/lib/auth-fetch"
import { toFormError, type FormState } from "@/lib/form"
import { expirePropertyCaches } from "@/lib/properties"
import type { LandlordRequest, RentalRequest } from "@/lib/types"

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

// The landlord's changes, and the toast each one shows
export type LandlordRequestChange = "APPROVED" | "REJECTED" | "COMPLETED"

const CHANGED: Record<LandlordRequestChange, string> = {
  APPROVED: "Request approved",
  REJECTED: "Request rejected",
  COMPLETED: "Request completed",
}

/*
The backend checks that the request is for the landlord's property and that the change is
allowed from its status; its 409 messages (property not available, checkout in progress, already
changed) become toasts. Approving reserves the property, and rejecting an approved request or
completing one frees it, so the property's public pages are fetched afresh. Success shows the
change; a 404 or 409 means the list is stale, so it shows the current one
*/
export const setRequestStatusAction = async (
  requestId: string,
  propertyId: string,
  status: LandlordRequestChange,
): Promise<FormState<never>> => {
  const result = await authFetch<LandlordRequest>(
    `/api/landlord/requests/${encodeURIComponent(requestId)}`,
    { method: "PATCH", body: { status } },
  )

  if (result.success) {
    expirePropertyCaches(propertyId)
  }

  if (result.success || result.statusCode === 404 || result.statusCode === 409) {
    refresh()
  }

  return result.success ? { success: true, message: CHANGED[status] } : toFormError(result)
}

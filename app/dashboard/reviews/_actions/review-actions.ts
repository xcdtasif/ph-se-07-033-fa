"use server"

import { refresh } from "next/cache"

import { authFetch } from "@/lib/auth-fetch"
import { toFormError, type FormState } from "@/lib/form"
import { expirePropertyCaches } from "@/lib/properties"

/*
The admin hides or unhides a review, which changes the property's public reviews, review count
and rating, so its cached pages are expired. Success shows the change; a 404 means the list is
stale, so it shows the current one
*/
export const setReviewHiddenAction = async (
  reviewId: string,
  propertyId: string,
  isHidden: boolean,
): Promise<FormState<never>> => {
  const result = await authFetch(`/api/admin/reviews/${encodeURIComponent(reviewId)}`, {
    method: "PATCH",
    body: { isHidden },
  })

  if (result.success) {
    expirePropertyCaches(propertyId)
  }

  if (result.success || result.statusCode === 404) {
    refresh()
  }

  return result.success ? { success: true, message: result.message } : toFormError(result)
}

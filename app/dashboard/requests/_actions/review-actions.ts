"use server"

import { refresh } from "next/cache"
import { z } from "zod"

import { authFetch } from "@/lib/auth-fetch"
import { formText, toFormError, type FormState } from "@/lib/form"
import { expirePropertyCaches } from "@/lib/properties"
import type { TenantReview } from "@/lib/types"

import { reviewSchema, type ReviewField } from "../_schemas/review-schema"

/*
The backend checks that the request is the tenant's own, COMPLETED and not yet reviewed; its
409 messages (not completed, already reviewed) become toasts. A new review changes the property's
public reviews, review count and rating, so its cached pages are expired
*/
export const createReviewAction = async (
  requestId: string,
  formData: FormData,
): Promise<FormState<ReviewField>> => {
  const values = { rating: formText(formData, "rating"), comment: formText(formData, "comment") }
  const parsed = reviewSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const result = await authFetch<TenantReview>("/api/tenant/reviews", {
    method: "POST",
    body: { requestId, ...parsed.data },
  })

  if (result.success) {
    expirePropertyCaches(result.data.propertyId)
  }

  // Success shows the card as reviewed; a 409 means the list is stale, so show the current state
  if (result.success || result.statusCode === 409) {
    refresh()
  }

  if (!result.success) {
    return toFormError(result, values)
  }

  return { success: true, message: result.message }
}

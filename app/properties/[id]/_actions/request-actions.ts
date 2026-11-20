"use server"

import { z } from "zod"

import { authFetch } from "@/lib/auth-fetch"
import { formText, toFormError, type FormState } from "@/lib/form"

import { requestSchema, type RequestField } from "../_schemas/request-schema"

export const createRequestAction = async (
  propertyId: string,
  formData: FormData,
): Promise<FormState<RequestField>> => {
  const values = { message: formText(formData, "message") }
  const parsed = requestSchema.safeParse(values)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  /*
  409 (property no longer available, or an open request already exists) and
  403 (not a tenant, or banned) come back as the backend's own message
  */
  const result = await authFetch("/api/tenant/requests", {
    method: "POST",
    body: { propertyId, ...parsed.data },
  })

  if (!result.success) {
    return toFormError(result, values)
  }

  return { success: true, message: result.message }
}

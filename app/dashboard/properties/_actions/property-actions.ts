"use server"

import { refresh } from "next/cache"

import type { ApiResponse } from "@/lib/api"
import { authFetch } from "@/lib/auth-fetch"
import { toFormError, type FormState } from "@/lib/form"

// Success shows the change; a 404 or 409 means the list is stale, so show the current one
const settle = (result: ApiResponse<unknown>): FormState<never> => {
  if (result.success || result.statusCode === 404 || result.statusCode === 409) {
    refresh()
  }

  return result.success ? { success: true, message: result.message } : toFormError(result)
}

/*
Marking a property unavailable rejects its pending requests. The backend refuses a reserved or
rented property's status change with a 409, which becomes a toast
*/
export const setPropertyAvailabilityAction = async (
  propertyId: string,
  status: "AVAILABLE" | "UNAVAILABLE",
) =>
  settle(
    await authFetch(`/api/landlord/properties/${encodeURIComponent(propertyId)}`, {
      method: "PATCH",
      body: { status },
    }),
  )

// The backend refuses a property that has any requests with a 409, which becomes a toast
export const deletePropertyAction = async (propertyId: string) =>
  settle(
    await authFetch(`/api/landlord/properties/${encodeURIComponent(propertyId)}`, {
      method: "DELETE",
    }),
  )

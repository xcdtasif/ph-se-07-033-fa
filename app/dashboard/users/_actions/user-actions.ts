"use server"

import { refresh } from "next/cache"

import { authFetch } from "@/lib/auth-fetch"
import { toFormError, type FormState } from "@/lib/form"
import { expirePropertyCaches } from "@/lib/properties"
import type { Property, User, UserRole } from "@/lib/types"

// The backend's largest page
const MAX_LIMIT = 50

/*
A banned landlord's properties leave the public pages and come back on unban, so their cached
copies are expired: the list, and each property's page
*/
const expireLandlordProperties = async (landlordId: string) => {
  expirePropertyCaches()

  for (let page = 1; ; page++) {
    const result = await authFetch<Property[]>(
      `/api/admin/properties?page=${page}&limit=${MAX_LIMIT}&landlordId=${encodeURIComponent(landlordId)}`,
    )

    if (!result.success) {
      return
    }

    for (const property of result.data) {
      expirePropertyCaches(property.id)
    }

    if (result.data.length < MAX_LIMIT || page * MAX_LIMIT >= (result.meta?.total ?? 0)) {
      return
    }
  }
}

/*
Bans or unbans a user; the backend refuses an admin (403) and a missing user (404), whose
messages become toasts. A ban locks the user out at once and hides a landlord's properties.
Success shows the new status; a 404 means the list is stale, so it shows the current one
*/
export const setUserBannedAction = async (
  userId: string,
  role: UserRole,
  isBanned: boolean,
): Promise<FormState<never>> => {
  const result = await authFetch<User>(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: { isBanned },
  })

  if (result.success && role === "LANDLORD") {
    await expireLandlordProperties(userId)
  }

  if (result.success || result.statusCode === 404) {
    refresh()
  }

  return result.success ? { success: true, message: result.message } : toFormError(result)
}

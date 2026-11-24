"use server"

import { refresh } from "next/cache"
import { z } from "zod"

import { authFetch } from "@/lib/auth-fetch"
import { formText, toFormError, type FormState } from "@/lib/form"
import { expirePropertyCaches } from "@/lib/properties"

import { propertySchema, type PropertyField } from "../_schemas/property-schema"

/*
Marking a property unavailable rejects its pending requests. The backend refuses a reserved or
rented property's status change with a 409, which becomes a toast. Success shows the change; a
404 or 409 means the list is stale, so it shows the current one
*/
export const setPropertyAvailabilityAction = async (
  propertyId: string,
  status: "AVAILABLE" | "UNAVAILABLE",
): Promise<FormState<never>> => {
  const result = await authFetch(`/api/landlord/properties/${encodeURIComponent(propertyId)}`, {
    method: "PATCH",
    body: { status },
  })

  if (result.success) {
    expirePropertyCaches(propertyId)
  }

  if (result.success || result.statusCode === 404 || result.statusCode === 409) {
    refresh()
  }

  return result.success ? { success: true, message: result.message } : toFormError(result)
}

/*
The backend refuses a property that has any requests with a 409, which becomes a toast. On
success the edit page leaves for the list, so there's nothing here to refresh
*/
export const deletePropertyAction = async (propertyId: string): Promise<FormState<never>> => {
  const result = await authFetch(`/api/landlord/properties/${encodeURIComponent(propertyId)}`, {
    method: "DELETE",
  })

  if (result.success) {
    expirePropertyCaches(propertyId)

    return { success: true, message: result.message }
  }

  // Gone or changed since the page loaded: show its current state
  if (result.statusCode === 404 || result.statusCode === 409) {
    refresh()
  }

  return toFormError(result)
}

// The form's fields; `images` holds the uploaded photos' URLs, the cover first
const readPropertyForm = (formData: FormData) => {
  const values = {
    categoryId: formText(formData, "categoryId"),
    name: formText(formData, "name"),
    description: formText(formData, "description"),
    location: formText(formData, "location"),
    rent: formText(formData, "rent"),
    deposit: formText(formData, "deposit"),
  }
  const images = formData.getAll("images").filter((value) => typeof value === "string")

  return { values, parsed: propertySchema.safeParse({ ...values, images }) }
}

const saveProperty = async (
  formData: FormData,
  request: { path: string; method: "POST" | "PATCH"; propertyId?: string },
): Promise<FormState<PropertyField>> => {
  const { values, parsed } = readPropertyForm(formData)

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the highlighted fields",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  const result = await authFetch(request.path, { method: request.method, body: parsed.data })

  if (!result.success) {
    return toFormError(result, values)
  }

  expirePropertyCaches(request.propertyId)

  return { success: true, message: result.message }
}

export const createPropertyAction = async (formData: FormData) =>
  saveProperty(formData, { path: "/api/landlord/properties", method: "POST" })

/*
Sends every field; the backend replaces the photo list and deletes the files left out. It
refuses a reserved property with a 409, which becomes a toast
*/
export const updatePropertyAction = async (propertyId: string, formData: FormData) =>
  saveProperty(formData, {
    path: `/api/landlord/properties/${encodeURIComponent(propertyId)}`,
    method: "PATCH",
    propertyId,
  })

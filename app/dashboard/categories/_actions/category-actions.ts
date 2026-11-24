"use server"

import { refresh } from "next/cache"
import { z } from "zod"

import { authFetch } from "@/lib/auth-fetch"
import { expireCategoryCaches } from "@/lib/categories"
import { formText, toFormError, type FormState } from "@/lib/form"
import { expirePropertyCaches } from "@/lib/properties"
import type { Category } from "@/lib/types"

import { categorySchema, type CategoryField } from "../_schemas/category-schema"

const categoryPath = (categoryId: string) => `/api/categories/${encodeURIComponent(categoryId)}`

/*
Sends the name to the backend, or returns the field errors without calling it. Gives the form's
state and the backend's status, 0 when it wasn't called
*/
const saveCategory = async (
  path: string,
  method: "POST" | "PATCH",
  formData: FormData,
): Promise<[FormState<CategoryField>, number]> => {
  const values = { name: formText(formData, "name") }
  const parsed = categorySchema.safeParse(values)

  if (!parsed.success) {
    const state = {
      success: false,
      message: "Please fix the highlighted fields",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }

    return [state, 0]
  }

  const result = await authFetch<Category>(path, { method, body: parsed.data })

  const state = result.success
    ? { success: true, message: result.message }
    : toFormError<CategoryField>(result, values)

  return [state, result.statusCode]
}

// A name already in use, in any case, is a 409 whose message becomes a toast
export const createCategoryAction = async (formData: FormData) => {
  const [state] = await saveCategory("/api/categories", "POST", formData)

  if (state.success) {
    expireCategoryCaches()
    refresh()
  }

  return state
}

/*
The new name shows on the public list's cards and on the category's property pages, so those
expire too. A 404 means the list is stale, so it shows the current one
*/
export const renameCategoryAction = async (categoryId: string, formData: FormData) => {
  const [state, statusCode] = await saveCategory(categoryPath(categoryId), "PATCH", formData)

  if (state.success) {
    expirePropertyCaches()
  }

  if (state.success || statusCode === 404) {
    expireCategoryCaches(categoryId)
    refresh()
  }

  return state
}

/*
The backend refuses a category that still has properties (409), whose message becomes a toast.
Success, or a 404 for one already gone, shows the current list
*/
export const deleteCategoryAction = async (categoryId: string): Promise<FormState<never>> => {
  const result = await authFetch<null>(categoryPath(categoryId), { method: "DELETE" })

  if (result.success || result.statusCode === 404) {
    expireCategoryCaches(categoryId)
    refresh()
  }

  return result.success ? { success: true, message: result.message } : toFormError(result)
}

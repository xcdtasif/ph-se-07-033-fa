"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { apiRequest } from "@/lib/api"
import { clearAuthCookies, relayAuthCookies } from "@/lib/auth-cookies"
import { formText, toFormError, type FormState } from "@/lib/form"
import type { User } from "@/lib/types"

import {
  loginSchema,
  registerSchema,
  type LoginField,
  type RegisterField,
} from "../_schemas/auth-schemas"

const INVALID_FIELDS_MESSAGE = "Please fix the highlighted fields"
const NO_SESSION_MESSAGE = "We couldn't log you in. Please try again."

// Calls a backend auth endpoint and stores the tokens it returns as cookies
const authenticate = async <Field extends string>(
  path: string,
  body: unknown,
  values: FormState<Field>["values"],
): Promise<FormState<Field>> => {
  const { result, setCookies } = await apiRequest<User>(path, { method: "POST", body })

  if (!result.success) {
    return toFormError(result, values)
  }

  if (!(await relayAuthCookies(setCookies))) {
    return { success: false, message: NO_SESSION_MESSAGE, values }
  }

  return { success: true, message: result.message }
}

export const loginAction = async (formData: FormData): Promise<FormState<LoginField>> => {
  const values = { email: formText(formData, "email") }
  const parsed = loginSchema.safeParse({ ...values, password: formText(formData, "password") })

  if (!parsed.success) {
    return {
      success: false,
      message: INVALID_FIELDS_MESSAGE,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  return authenticate("/api/auth/login", parsed.data, values)
}

export const registerAction = async (formData: FormData): Promise<FormState<RegisterField>> => {
  const values = {
    name: formText(formData, "name"),
    email: formText(formData, "email"),
    role: formText(formData, "role"),
  }
  const parsed = registerSchema.safeParse({ ...values, password: formText(formData, "password") })

  if (!parsed.success) {
    return {
      success: false,
      message: INVALID_FIELDS_MESSAGE,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  return authenticate("/api/auth/register", parsed.data, values)
}

/*
Logs out by deleting the auth cookies on this domain. The backend tokens are
stateless, so there is nothing to revoke there. Redirecting here, rather than
on the client, keeps the action from re-rendering a protected page without a
session first.
*/
export const logoutAction = async () => {
  await clearAuthCookies()
  redirect("/")
}

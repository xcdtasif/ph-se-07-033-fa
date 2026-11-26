"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { apiRequest } from "@/lib/api"
import { clearAuthCookies, relayAuthCookies } from "@/lib/auth-cookies"
import { formText, toFormError, type FormState } from "@/lib/form"
import type { User } from "@/lib/types"

import {
  loginSchema,
  signupSchema,
  type LoginField,
  type SignupField,
} from "../_schemas/auth-schemas"

const INVALID_FIELDS_MESSAGE = "Please fix the highlighted fields"
const NO_SESSION_MESSAGE = "We couldn't log you in. Please try again."

// Calls a backend auth endpoint and stores the tokens it returns as cookies
const authenticate = async <Field extends string>(
  path: string,
  body: unknown,
  values?: FormState<Field>["values"],
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

/*
The sample users the backend seeds (src/db/seeders), for testers to log in without typing. Their
shared password is already public in the backend's README, and keeping it here, on the server,
means the client only sends which account it wants.
*/
const DEMO_ACCOUNTS = {
  admin: "admin01@gmail.com",
  landlord: "landlord01@gmail.com",
  tenant: "tenant01@gmail.com",
} as const
const DEMO_PASSWORD = "1a2s3d4f"

export const demoLoginAction = async (formData: FormData): Promise<FormState<never>> => {
  const account = formText(formData, "account")

  if (!Object.hasOwn(DEMO_ACCOUNTS, account)) {
    return { success: false, message: "Unknown demo account" }
  }

  return authenticate("/api/auth/login", {
    email: DEMO_ACCOUNTS[account as keyof typeof DEMO_ACCOUNTS],
    password: DEMO_PASSWORD,
  })
}

export const signupAction = async (formData: FormData): Promise<FormState<SignupField>> => {
  const values = {
    name: formText(formData, "name"),
    email: formText(formData, "email"),
    role: formText(formData, "role"),
  }
  const parsed = signupSchema.safeParse({ ...values, password: formText(formData, "password") })

  if (!parsed.success) {
    return {
      success: false,
      message: INVALID_FIELDS_MESSAGE,
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    }
  }

  return authenticate("/api/auth/signup", parsed.data, values)
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

/*
Ends a session the backend no longer accepts (account deleted, token rejected)
and opens the login page. Like logout, redirecting from an action re-renders
the whole page, so the navbar drops the old name too.
*/
export const loginAgainAction = async () => {
  await clearAuthCookies()
  redirect("/login")
}

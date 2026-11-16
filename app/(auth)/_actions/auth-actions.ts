"use server"

import { z } from "zod"

import { apiRequest } from "@/lib/api"
import { relayAuthCookies } from "@/lib/auth-cookies"
import { toFormError, type FormState } from "@/lib/form"
import type { User } from "@/lib/types"

import {
  loginSchema,
  registerSchema,
  type LoginField,
  type RegisterField,
} from "../_schemas/auth-schemas"

const INVALID_FIELDS_MESSAGE = "Please fix the highlighted fields"
const NO_SESSION_MESSAGE = "We couldn't sign you in. Please try again."

const text = (formData: FormData, name: string) => {
  const value = formData.get(name)

  return typeof value === "string" ? value : ""
}

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
  const values = { email: text(formData, "email") }
  const parsed = loginSchema.safeParse({ ...values, password: text(formData, "password") })

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
    name: text(formData, "name"),
    email: text(formData, "email"),
    role: text(formData, "role"),
  }
  const parsed = registerSchema.safeParse({ ...values, password: text(formData, "password") })

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

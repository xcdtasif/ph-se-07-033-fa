import { z } from "zod"

import { nameSchema } from "@/lib/schemas"

// These mirror the backend rules in docs/api-docs/auth.md

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address" }))

const password = z
  .string()
  .min(8, { error: "Password must be at least 8 characters" })
  .max(72, { error: "Password must be at most 72 characters" })

export const loginSchema = z.object({ email, password })

export const signupSchema = z.object({
  name: nameSchema,
  email,
  password: password.refine((value) => new TextEncoder().encode(value).length <= 72, {
    error: "Password is too long",
  }),
  role: z.enum(["TENANT", "LANDLORD"], { error: "Choose how you'll use RentNest" }),
})

export type LoginField = keyof z.infer<typeof loginSchema>
export type SignupField = keyof z.infer<typeof signupSchema>

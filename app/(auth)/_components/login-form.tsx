"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { loginAction } from "../_actions/auth-actions"
import { useAuthForm } from "./use-auth-form"

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

export function LoginForm() {
  const [state, formAction, pending] = useAuthForm(loginAction)
  const errors = state.fieldErrors

  return (
    <form action={formAction} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors?.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(errors?.email)}
            required
          />
          <FieldError errors={toErrors(errors?.email)} />
        </Field>

        <Field data-invalid={Boolean(errors?.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors?.password)}
            required
          />
          <FieldError errors={toErrors(errors?.password)} />
        </Field>

        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </FieldGroup>
    </form>
  )
}

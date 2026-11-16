"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { registerAction } from "../_actions/auth-actions"
import { useAuthForm } from "./use-auth-form"

const ROLES = [
  { value: "TENANT", title: "Tenant", description: "I'm looking for a place to rent" },
  { value: "LANDLORD", title: "Landlord", description: "I want to list my properties" },
]

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

export function RegisterForm() {
  const [state, formAction, pending] = useAuthForm(registerAction)
  const errors = state.fieldErrors

  return (
    <form action={formAction} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors?.name)}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            defaultValue={state.values?.name}
            aria-invalid={Boolean(errors?.name)}
            required
          />
          <FieldError errors={toErrors(errors?.name)} />
        </Field>

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
            autoComplete="new-password"
            aria-invalid={Boolean(errors?.password)}
            required
          />
          <FieldDescription>At least 8 characters.</FieldDescription>
          <FieldError errors={toErrors(errors?.password)} />
        </Field>

        <FieldSet>
          <FieldLegend variant="label">I'm joining as a</FieldLegend>
          <RadioGroup name="role" defaultValue={state.values?.role || "TENANT"}>
            {ROLES.map((role) => (
              <FieldLabel key={role.value} htmlFor={`role-${role.value}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{role.title}</FieldTitle>
                    <FieldDescription>{role.description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem id={`role-${role.value}`} value={role.value} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          <FieldError errors={toErrors(errors?.role)} />
        </FieldSet>

        <Button type="submit" disabled={pending}>
          {pending ? "Registering…" : "Register"}
        </Button>
      </FieldGroup>
    </form>
  )
}

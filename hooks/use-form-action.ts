"use client"

import { useActionState, useState, type FormEvent } from "react"
import { toast } from "sonner"

import type { FormState } from "@/lib/form"

/*
Runs a server action from a form through useActionState: shows its message as a toast and
calls `onSuccess` when it succeeds. Returns the state, the form action, whether it's pending,
an onChange handler for the form that drops a field's error once the user edits that field, and
the same for a field by name; the next submit shows errors afresh.
*/
export const useFormAction = <Field extends string>(
  action: (formData: FormData) => Promise<FormState<Field>>,
  onSuccess?: (state: FormState<Field>) => void,
) => {
  const [state, formAction, pending] = useActionState(
    async (_previous: FormState<Field>, formData: FormData) => {
      const state = await action(formData)

      if (state.success) {
        toast.success(state.message)
        onSuccess?.(state)
      } else {
        toast.error(state.message)
      }

      return state
    },
    { success: false, message: "" },
  )

  // The fields edited since `state` arrived; a new state starts with none
  const [edited, setEdited] = useState({ state, fields: new Set<string>() })
  const editedFields = edited.state === state ? edited.fields : new Set<string>()

  const fieldErrors = state.fieldErrors
    ? (Object.fromEntries(
        Object.entries(state.fieldErrors).filter(([field]) => !editedFields.has(field)),
      ) as FormState<Field>["fieldErrors"])
    : undefined

  // For fields that don't fire a change event on the form, like a select or a removed photo
  const clearFieldError = (name: string) => {
    if (fieldErrors && name in fieldErrors) {
      setEdited({ state, fields: new Set(editedFields).add(name) })
    }
  }

  // Change events from the form's fields bubble up to the form
  const onFormChange = (event: FormEvent<HTMLFormElement>) => {
    clearFieldError((event.target as HTMLInputElement).name)
  }

  return [{ ...state, fieldErrors }, formAction, pending, onFormChange, clearFieldError] as const
}

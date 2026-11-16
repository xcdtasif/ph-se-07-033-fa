"use client"

import { useActionState } from "react"
import { toast } from "sonner"

import type { FormState } from "@/lib/form"

/*
Runs a server action from a form through useActionState: shows its message as
a toast and calls `onSuccess` when it succeeds.
*/
export const useFormAction = <Field extends string>(
  action: (formData: FormData) => Promise<FormState<Field>>,
  onSuccess?: (state: FormState<Field>) => void,
) =>
  useActionState(
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

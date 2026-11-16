"use client"

import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { toast } from "sonner"

import type { FormState } from "@/lib/form"

/*
Runs an auth server action from a form: shows its message as a toast and goes
to the home page once the user is logged in.
*/
export const useAuthForm = <Field extends string>(
  action: (formData: FormData) => Promise<FormState<Field>>,
) => {
  const router = useRouter()

  return useActionState(
    async (_previous: FormState<Field>, formData: FormData) => {
      const state = await action(formData)

      if (state.success) {
        toast.success(state.message)
        router.push("/")
      } else {
        toast.error(state.message)
      }

      return state
    },
    { success: false, message: "" },
  )
}

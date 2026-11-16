"use client"

import { useRouter } from "next/navigation"
import { useActionState } from "react"
import { toast } from "sonner"

import type { FormState } from "@/lib/form"
import { safeRedirectPath } from "@/lib/redirect"

/*
Runs an auth server action from a form: shows its message as a toast and, once
the user is logged in, goes to the page in `?redirectTo=` (set by the proxy when
it sent them to log in) or to the home page. The query is read from
`window.location` at submit time so the form doesn't need `useSearchParams`,
which would keep it out of the prerendered page.
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
        router.push(safeRedirectPath(new URLSearchParams(window.location.search).get("redirectTo")))
      } else {
        toast.error(state.message)
      }

      return state
    },
    { success: false, message: "" },
  )
}

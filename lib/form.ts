import type { ApiFailure } from "@/lib/api"

// What a form's server action returns to the form
export type FormState<Field extends string> = {
  success: boolean
  message: string
  fieldErrors?: Partial<Record<Field, string[]>>
  // Submitted values, sent back so the form keeps them after a failed submit
  values?: Partial<Record<Field, string>>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

/*
Turns a failed backend response into a form state. When the backend rejected
the body (400), its `errorDetails.fieldErrors` become the form's field errors.
*/
export const toFormError = <Field extends string>(
  failure: ApiFailure,
  values?: FormState<Field>["values"],
): FormState<Field> => {
  const details = failure.errorDetails
  const fieldErrors =
    isRecord(details) && isRecord(details.fieldErrors)
      ? (details.fieldErrors as FormState<Field>["fieldErrors"])
      : undefined

  return { success: false, message: failure.message, fieldErrors, values }
}

// A text field's value from FormData, or "" when it is missing or a file
export const formText = (formData: FormData, name: string) => {
  const value = formData.get(name)

  return typeof value === "string" ? value : ""
}

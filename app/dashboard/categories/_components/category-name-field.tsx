import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NO_AUTOFILL } from "@/lib/form"

import { CATEGORY_NAME_MAX_LENGTH } from "../_schemas/category-schema"

type CategoryNameFieldProps = {
  id: string
  defaultValue?: string
  errors?: string[]
  placeholder?: string
  inputClassName?: string
}

// The Name field of the add form and the rename dialog, its error under it
export function CategoryNameField({
  id,
  defaultValue,
  errors,
  placeholder,
  inputClassName,
}: CategoryNameFieldProps) {
  return (
    <Field data-invalid={Boolean(errors)}>
      <FieldLabel htmlFor={id}>Name</FieldLabel>
      <Input
        id={id}
        name="name"
        maxLength={CATEGORY_NAME_MAX_LENGTH}
        defaultValue={defaultValue}
        aria-invalid={Boolean(errors)}
        placeholder={placeholder}
        required
        className={inputClassName}
        {...NO_AUTOFILL}
      />
      <FieldError errors={errors?.map((message) => ({ message }))} />
    </Field>
  )
}

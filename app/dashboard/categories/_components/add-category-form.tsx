"use client"

import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { useFormAction } from "@/hooks/use-form-action"

import { createCategoryAction } from "../_actions/category-actions"
import { CategoryNameField } from "./category-name-field"

// Laid out like the profile's edit form; the field empties once the category is added
export function AddCategoryForm() {
  const [state, formAction, pending, formProps] = useFormAction(createCategoryAction)

  return (
    <form action={formAction} {...formProps} noValidate>
      <FieldGroup>
        <CategoryNameField
          id="new-category"
          defaultValue={state.values?.name}
          errors={state.fieldErrors?.name}
          placeholder="e.g. Studio"
        />
        <Button type="submit" size="sm" disabled={pending} className="self-center text-sm">
          {pending ? "Adding…" : "Add category"}
        </Button>
      </FieldGroup>
    </form>
  )
}

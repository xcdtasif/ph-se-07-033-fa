"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFormAction } from "@/hooks/use-form-action"
import type { Category } from "@/lib/types"

import { renameCategoryAction } from "../_actions/category-actions"
import { CategoryNameField } from "./category-name-field"

// A row's Rename: the name in a field, saved on submit
export function RenameCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending, formProps] = useFormAction(
    (formData: FormData) => renameCategoryAction(category.id, formData),
    () => setOpen(false),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Rename
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={formAction} {...formProps} noValidate className="grid grid-cols-1 gap-4">
          <DialogHeader>
            <DialogTitle>Rename this category</DialogTitle>
          </DialogHeader>
          <CategoryNameField
            id={`category-name-${category.id}`}
            defaultValue={state.values?.name ?? category.name}
            errors={state.fieldErrors?.name}
            // Centred like the dialog's label, as the request and review dialogs' text
            inputClassName="text-center"
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

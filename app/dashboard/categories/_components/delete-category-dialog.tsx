"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useFormAction } from "@/hooks/use-form-action"
import type { Category } from "@/lib/types"

import { deleteCategoryAction } from "../_actions/category-actions"

/*
A row's Delete, asked first. A category that still has properties is
refused with a toast, and the dialog stays open
*/
export function DeleteCategoryDialog({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)
  const [, formAction, pending] = useFormAction(
    () => deleteCategoryAction(category.id),
    () => setOpen(false),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this category?</DialogTitle>
          <DialogDescription>Only a category with no properties can be deleted.</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting…" : "Delete category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

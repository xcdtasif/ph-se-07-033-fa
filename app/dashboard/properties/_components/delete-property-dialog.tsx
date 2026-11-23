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

import { deletePropertyAction } from "../_actions/property-actions"

// Asks first: deleting can't be undone and removes the property's photos too
export function DeletePropertyDialog({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false)
  const [, formAction, pending] = useFormAction(
    () => deletePropertyAction(propertyId),
    () => setOpen(false),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Delete
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this property?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone. A property with requests can&apos;t be deleted; mark it
            unavailable instead.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Keep property</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Deleting…" : "Delete property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

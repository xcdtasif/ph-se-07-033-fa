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
import type { FormState } from "@/lib/form"

type HideButtonProps = {
  isHidden: boolean
  // A server action bound to the item, given whether to hide it
  action: (isHidden: boolean) => Promise<FormState<never>>
  // What's hidden, e.g. "property", for the dialog's title and button
  noun: string
  // What hiding does, under the dialog's title
  description: string
}

/*
The admin's Hide or Unhide for a property or a review. Unhiding happens at once. Hiding asks
first, since it takes the item off the public pages at once.
*/
export function HideButton({ isHidden, action, noun, description }: HideButtonProps) {
  const [open, setOpen] = useState(false)
  const [, formAction, pending] = useFormAction(
    () => action(!isHidden),
    () => setOpen(false),
  )

  if (isHidden) {
    return (
      <form action={formAction}>
        <Button type="submit" variant="outline" size="sm" className="text-sm" disabled={pending}>
          {pending ? "Saving…" : "Unhide"}
        </Button>
      </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Hide
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hide this {noun}?</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Hiding…" : `Hide ${noun}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

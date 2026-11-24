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

import { setPropertyHiddenAction } from "../_actions/property-actions"

type HideButtonProps = {
  propertyId: string
  isHidden: boolean
}

/*
Unhiding happens at once. Hiding asks first, since tenants lose the property at once: it leaves
the listings, and its requests can't be approved or paid for until it's unhidden.
*/
export function HideButton({ propertyId, isHidden }: HideButtonProps) {
  const [open, setOpen] = useState(false)
  const [, formAction, pending] = useFormAction(
    () => setPropertyHiddenAction(propertyId, !isHidden),
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
          <DialogTitle>Hide this property?</DialogTitle>
          <DialogDescription>
            Tenants can&apos;t find, request or pay for it until it&apos;s unhidden.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Hiding…" : "Hide property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

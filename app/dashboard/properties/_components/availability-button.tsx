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

import { setPropertyAvailabilityAction } from "../_actions/property-actions"

type AvailabilityButtonProps = {
  propertyId: string
  status: "AVAILABLE" | "UNAVAILABLE"
}

/*
Marking a property available happens at once. Marking it unavailable asks first, since it
rejects every pending request for it.
*/
export function AvailabilityButton({ propertyId, status }: AvailabilityButtonProps) {
  const [open, setOpen] = useState(false)
  const next = status === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE"
  const [, formAction, pending] = useFormAction(
    () => setPropertyAvailabilityAction(propertyId, next),
    () => setOpen(false),
  )

  if (next === "AVAILABLE") {
    return (
      <form action={formAction}>
        <Button type="submit" variant="outline" size="sm" className="text-sm" disabled={pending}>
          {pending ? "Saving…" : "Mark as available"}
        </Button>
      </form>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Mark as unavailable
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark this property as unavailable?</DialogTitle>
          <DialogDescription>
            Tenants won&apos;t find it in the listings, and its pending requests will be rejected.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Keep available</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Mark as unavailable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import type { RequestStatus } from "@/lib/types"

import { cancelRequestAction } from "../_actions/request-actions"

type CancelRequestDialogProps = {
  requestId: string
  status: RequestStatus
}

// Asks first: cancelling can't be undone, and an approved request gives up the reserved property
export function CancelRequestDialog({ requestId, status }: CancelRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [, formAction, pending] = useFormAction(
    () => cancelRequestAction(requestId),
    () => setOpen(false),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Cancel request
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel this request?</DialogTitle>
          <DialogDescription>
            {status === "APPROVED"
              ? "This property will be available to others again."
              : "You can send a new request later."}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Keep request</DialogClose>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Cancelling…" : "Cancel request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

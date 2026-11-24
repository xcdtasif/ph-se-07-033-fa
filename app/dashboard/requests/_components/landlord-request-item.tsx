"use client"

import { useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"

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
import type { LandlordRequest } from "@/lib/types"

import { setRequestStatusAction, type LandlordRequestChange } from "../_actions/request-actions"
import { RequestCardDetails } from "./request-card"

type ConfirmChangeProps = {
  label: string
  title: string
  description: string
  keepLabel: string
  disabled: boolean
  onConfirm: () => void
}

// A change that can't be undone asks first; confirming closes the dialog and applies it at once
function ConfirmChange({
  label,
  title,
  description,
  keepLabel,
  disabled,
  onConfirm,
}: ConfirmChangeProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="text-sm" disabled={disabled} />}
      >
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{keepLabel}</DialogClose>
          <Button
            variant="destructive"
            onClick={() => {
              setOpen(false)
              onConfirm()
            }}
          >
            {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type LandlordRequestItemProps = {
  request: LandlordRequest
  // Off on the property's own page, where the card has only the tenant's name above the message
  showProperty?: boolean
}

/*
A card like the tenant's: the request's details (the property linking to its dashboard page),
then the actions centred in a footer. A change shows at once (the badge and the footer follow it) while the backend saves it;
a failure shows its toast and the card goes back to the request's current state. Approve shows
only while the property is available, since approving reserves it.
*/
export function LandlordRequestItem({ request, showProperty = true }: LandlordRequestItemProps) {
  const { property } = request
  const [status, setStatus] = useOptimistic(request.status)
  const [pending, startTransition] = useTransition()

  const change = (next: LandlordRequestChange) => {
    startTransition(async () => {
      setStatus(next)
      const result = await setRequestStatusAction(request.id, property.id, next)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    })
  }

  const reject = (
    <ConfirmChange
      label="Reject request"
      title="Reject this request?"
      description={
        status === "APPROVED"
          ? "The property will be available to others again."
          : "This can't be undone."
      }
      keepLabel="Keep request"
      disabled={pending}
      onConfirm={() => change("REJECTED")}
    />
  )

  return (
    <li className="bg-card flex flex-col rounded-xl border p-4">
      <RequestCardDetails
        request={request}
        status={status}
        propertyHref={`/dashboard/properties/${property.id}`}
        showProperty={showProperty}
      />
      {/* Spaced like the tenant's cards; a note is as tall as the buttons */}
      <div className="divider-dashed mt-6 flex flex-wrap justify-center gap-2 pt-4">
        {status === "PENDING" ? (
          <>
            {reject}
            {property.status === "AVAILABLE" && (
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                disabled={pending}
                onClick={() => change("APPROVED")}
              >
                Approve request
              </Button>
            )}
          </>
        ) : status === "APPROVED" ? (
          reject
        ) : status === "ACTIVE" ? (
          <ConfirmChange
            label="Complete request"
            title="Complete this request?"
            description="The property will be available again, and the tenant can review it."
            keepLabel="Keep active"
            disabled={pending}
            onConfirm={() => change("COMPLETED")}
          />
        ) : (
          <p className="text-muted-foreground flex h-7 items-center text-sm">
            This request is {status.toLowerCase()}
          </p>
        )}
      </div>
    </li>
  )
}

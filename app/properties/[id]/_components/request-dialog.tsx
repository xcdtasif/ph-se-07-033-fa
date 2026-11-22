"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useFormAction } from "@/hooks/use-form-action"

import { createRequestAction } from "../_actions/request-actions"
import { MESSAGE_MAX_LENGTH } from "../_schemas/request-schema"

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

type RequestDialogProps = {
  propertyId: string
  propertyName: string
}

export function RequestDialog({ propertyId, propertyName }: RequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useFormAction(
    (formData: FormData) => createRequestAction(propertyId, formData),
    () => setOpen(false),
  )
  const errors = state.fieldErrors

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="text-sm" />}>
        Request to rent
      </DialogTrigger>
      <DialogContent className="grid-cols-1 sm:max-w-md">
        <form action={formAction} noValidate className="grid grid-cols-1 gap-4">
          <DialogTitle className="sr-only">{`Request to rent ${propertyName}`}</DialogTitle>

          <Field data-invalid={Boolean(errors?.message)}>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea
              id="message"
              name="message"
              rows={5}
              maxLength={MESSAGE_MAX_LENGTH}
              defaultValue={state.values?.message}
              aria-invalid={Boolean(errors?.message)}
              placeholder={`Tell the landlord about yourself and when you'd like to move in (10 to ${MESSAGE_MAX_LENGTH} characters)`}
              className="max-h-64 min-h-0 text-sm"
              required
            />
            <FieldError errors={toErrors(errors?.message)} />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

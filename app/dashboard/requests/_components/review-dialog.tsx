"use client"

import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useFormAction } from "@/hooks/use-form-action"

import { createReviewAction } from "../_actions/review-actions"
import { COMMENT_MAX_LENGTH } from "../_schemas/review-schema"
import { RatingInput } from "./rating-input"

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

type ReviewDialogProps = {
  requestId: string
  propertyName: string
}

// A completed rental's review: a star rating and a comment, sent once
export function ReviewDialog({ requestId, propertyName }: ReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const [state, formAction, pending, onFormChange] = useFormAction(
    (formData: FormData) => createReviewAction(requestId, formData),
    () => setOpen(false),
  )
  const errors = state.fieldErrors

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-sm" />}>
        Leave review
      </DialogTrigger>
      {/* Focuses the dialog itself, not the first field, so the placeholder shows until a click */}
      <DialogContent ref={popupRef} initialFocus={popupRef} className="grid-cols-1 sm:max-w-md">
        <form
          action={formAction}
          onChange={onFormChange}
          noValidate
          className="grid grid-cols-1 gap-4"
        >
          <DialogTitle className="sr-only">{`Review ${propertyName}`}</DialogTitle>

          {/* Centred like the dialog's field labels */}
          <FieldSet data-invalid={Boolean(errors?.rating)} className="items-center gap-2">
            <FieldLegend variant="label" className="w-full text-center">
              Rating
            </FieldLegend>
            <RatingInput
              name="rating"
              defaultValue={Number(state.values?.rating) || 0}
              invalid={Boolean(errors?.rating)}
            />
            <FieldError errors={toErrors(errors?.rating)} />
          </FieldSet>

          <Field data-invalid={Boolean(errors?.comment)}>
            <FieldLabel htmlFor="comment">Comment</FieldLabel>
            <Textarea
              id="comment"
              name="comment"
              rows={5}
              maxLength={COMMENT_MAX_LENGTH}
              defaultValue={state.values?.comment}
              aria-invalid={Boolean(errors?.comment)}
              placeholder="Tell other tenants about the property and the landlord."
              className="max-h-64 min-h-0 text-center text-sm"
              required
            />
            <FieldError errors={toErrors(errors?.comment)} />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

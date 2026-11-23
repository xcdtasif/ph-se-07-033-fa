"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type ComponentProps } from "react"
import { z } from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useFormAction } from "@/hooks/use-form-action"
import { toAmountDigits } from "@/lib/amount"
import type { FormState } from "@/lib/form"
import type { Category, Property } from "@/lib/types"
import { uploadFiles } from "@/lib/uploadthing"

import {
  DESCRIPTION_MAX_LENGTH,
  propertySchema,
  type PropertyField,
  type PropertyValues,
} from "../_schemas/property-schema"
import { PhotoPicker, type Photo } from "./photo-picker"

const toErrors = (messages?: string[]) => messages?.map((message) => ({ message }))

type PropertyFormProps = {
  categories: Category[]
  // The property being edited; none for a new one
  property?: Property
  action: (formData: FormData) => Promise<FormState<PropertyField>>
  submitLabel: string
}

/*
Every field of a property, photos last. On submit it checks the fields here first, so nothing
uploads for a form the backend would reject, then uploads the new photos, then saves. Uploaded
photos replace their previews, so a retry after a failed save doesn't upload them again.
*/
export function PropertyForm({ categories, property, action, submitLabel }: PropertyFormProps) {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState<string | null>(property?.categoryId ?? null)
  const [photos, setPhotos] = useState<Photo[]>(
    () => property?.images.map((url) => ({ url })) ?? [],
  )
  const [uploading, setUploading] = useState(false)

  const save = async (formData: FormData): Promise<FormState<PropertyField>> => {
    const values: PropertyValues = Object.fromEntries(
      (["categoryId", "name", "description", "location", "rent", "deposit"] as const).map(
        (field) => [field, String(formData.get(field) ?? "")],
      ),
    )
    const parsed = propertySchema.safeParse({ ...values, images: photos.map(({ url }) => url) })

    if (!parsed.success) {
      return {
        success: false,
        message: "Please fix the highlighted fields",
        fieldErrors: z.flattenError(parsed.error).fieldErrors,
        values,
      }
    }

    let saved = photos
    const files = photos.flatMap(({ file }) => (file ? [file] : []))

    if (files.length > 0) {
      setUploading(true)

      try {
        const uploaded = await uploadFiles("propertyImage", { files })
        const urls = new Map(uploaded.map((result, index) => [files[index], result.ufsUrl]))

        saved = photos.map((photo) => {
          const url = photo.file && urls.get(photo.file)

          if (!url) return photo

          URL.revokeObjectURL(photo.url)

          return { url }
        })
        setPhotos(saved)
      } catch {
        return { success: false, message: "Couldn't upload the images, please try again", values }
      } finally {
        setUploading(false)
      }
    }

    formData.delete("images")
    for (const { url } of saved) {
      formData.append("images", url)
    }

    return action(formData)
  }

  const [state, formAction, pending, onFormChange, clearFieldError] = useFormAction(save, () =>
    router.push("/dashboard/properties"),
  )
  const errors = state.fieldErrors
  const values = state.values ?? {}

  const textField = (
    field: "name" | "location" | "rent" | "deposit",
    label: string,
    props: ComponentProps<typeof Input> = {},
  ) => (
    <Field data-invalid={Boolean(errors?.[field])}>
      <FieldLabel htmlFor={field}>{label}</FieldLabel>
      <Input
        id={field}
        name={field}
        defaultValue={values[field] ?? property?.[field] ?? ""}
        aria-invalid={Boolean(errors?.[field])}
        required
        {...props}
      />
      <FieldError errors={toErrors(errors?.[field])} />
    </Field>
  )

  // Digits only, whole taka and at most 9,99,999, like the rent filter
  const amountField = (field: "rent" | "deposit", label: string, placeholder: string) =>
    textField(field, label, {
      inputMode: "numeric",
      placeholder,
      defaultValue: values[field] ?? toAmountDigits(property?.[field] ?? ""),
      onChange: (event) => {
        event.currentTarget.value = toAmountDigits(event.currentTarget.value)
      },
    })

  return (
    <form action={formAction} onChange={onFormChange} noValidate>
      <FieldGroup>
        {textField("name", "Name", { placeholder: "Sunny 2-bed apartment in Dhanmondi" })}

        <Field data-invalid={Boolean(errors?.categoryId)}>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>
          <Select
            id="categoryId"
            name="categoryId"
            items={categories.map(({ id, name }) => ({ value: id, label: name }))}
            value={categoryId}
            onValueChange={(value) => {
              setCategoryId(value)
              clearFieldError("categoryId")
            }}
          >
            <SelectTrigger className="w-full" aria-invalid={Boolean(errors?.categoryId)}>
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(({ id, name }) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={toErrors(errors?.categoryId)} />
        </Field>
        {textField("location", "Location", { placeholder: "Dhanmondi, Dhaka" })}
        {amountField("rent", "Rent (BDT)", "28000")}
        {amountField("deposit", "Deposit (BDT)", "56000")}

        <Field data-invalid={Boolean(errors?.description)}>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            rows={5}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="Describe the rooms, the building and what's nearby."
            // The labels' size; the textarea is larger on small screens otherwise
            className="text-sm"
            defaultValue={values.description ?? property?.description ?? ""}
            aria-invalid={Boolean(errors?.description)}
            required
          />
          <FieldError errors={toErrors(errors?.description)} />
        </Field>

        {/* A legend, not a label, so only the Add image box opens the file picker */}
        <FieldSet data-invalid={Boolean(errors?.images)} className="gap-2">
          <FieldLegend variant="label">Images</FieldLegend>
          <FieldDescription>Max 2 MB, 3:2, WebP/PNG/JPG</FieldDescription>
          <PhotoPicker
            photos={photos}
            onChange={(update) => {
              setPhotos(update)
              clearFieldError("images")
            }}
            invalid={Boolean(errors?.images)}
          />
          <FieldError errors={toErrors(errors?.images)} />
        </FieldSet>

        <div className="flex justify-center gap-2">
          <Link
            href="/dashboard/properties"
            className={buttonVariants({ variant: "outline", size: "sm", className: "text-sm" })}
          >
            Cancel
          </Link>
          <Button type="submit" size="sm" disabled={pending} className="text-sm">
            {uploading ? "Uploading images…" : pending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}

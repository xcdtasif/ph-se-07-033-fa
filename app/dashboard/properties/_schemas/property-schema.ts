import { z } from "zod"

import { MAX_AMOUNT } from "@/lib/amount"
import { formatNumber } from "@/lib/format"
import { nameSchema } from "@/lib/schemas"
import { PROPERTY_IMAGE_MAX_COUNT } from "@/lib/uploadthing"

// The textarea stops here too, so the description can't grow past what the backend takes
export const DESCRIPTION_MAX_LENGTH = 2000

// An amount in whole taka as typed: required, more than 0, at most 9,99,999
const amountSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, { error: `Enter ${label.toLowerCase()} amount` })
    .pipe(
      z.coerce
        .number<string>({ error: `${label} must be a number` })
        .int({ error: `${label} must be in whole taka` })
        .positive({ error: `${label} must be more than 0` })
        .max(MAX_AMOUNT, { error: `${label} must be at most ${formatNumber(MAX_AMOUNT)}` }),
    )

// Mirrors POST /api/landlord/properties in docs/api-docs/property.md
export const propertySchema = z.object({
  categoryId: z.uuid({ error: "Choose a category" }),
  name: nameSchema,
  description: z
    .string()
    .trim()
    .min(10, { error: "Description must be at least 10 characters" })
    .max(DESCRIPTION_MAX_LENGTH, {
      error: `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters`,
    }),
  location: z
    .string()
    .trim()
    .min(2, { error: "Location must be at least 2 characters" })
    .max(200, { error: "Location must be at most 200 characters" }),
  rent: amountSchema("Rent"),
  deposit: amountSchema("Deposit"),
  images: z
    .array(z.string())
    .min(1, { error: "Add at least one image" })
    .max(PROPERTY_IMAGE_MAX_COUNT, { error: `Add at most ${PROPERTY_IMAGE_MAX_COUNT} images` }),
})

export type PropertyField = keyof z.infer<typeof propertySchema>

// The text fields as the form posts them, kept so a failed submit doesn't clear them
export type PropertyValues = Partial<Record<Exclude<PropertyField, "images">, string>>

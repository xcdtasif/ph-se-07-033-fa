import { z } from "zod"

export const CATEGORY_NAME_MAX_LENGTH = 50

// Mirrors POST and PATCH /api/categories in docs/api-docs/category.md
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(CATEGORY_NAME_MAX_LENGTH, {
      error: `Name must be at most ${CATEGORY_NAME_MAX_LENGTH} characters`,
    }),
})

export type CategoryField = keyof z.infer<typeof categorySchema>

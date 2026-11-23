import { z } from "zod"

export const COMMENT_MAX_LENGTH = 1000

/*
Mirrors POST /api/tenant/reviews in docs/api-docs/review.md. `requestId` comes from the card,
so only the rating and comment are form fields.
*/
export const reviewSchema = z.object({
  // A missing rating arrives as "", which coerces to 0
  rating: z.coerce
    .number()
    .int()
    .min(1, { error: "Choose a rating" })
    .max(5, { error: "Rating must be at most 5" }),
  comment: z
    .string()
    .trim()
    .min(10, { error: "Comment must be at least 10 characters" })
    .max(COMMENT_MAX_LENGTH, { error: `Comment must be at most ${COMMENT_MAX_LENGTH} characters` }),
})

export type ReviewField = keyof z.infer<typeof reviewSchema>

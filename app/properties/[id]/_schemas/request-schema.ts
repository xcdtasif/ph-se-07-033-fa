import { z } from "zod"

export const MESSAGE_MAX_LENGTH = 1000

/*
Mirrors POST /api/tenant/requests in docs/api-docs/request.md. Only the message
is a form field; `propertyId` comes from the page, already a property the backend found.
*/
export const requestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, { error: "Message must be at least 10 characters" })
    .max(MESSAGE_MAX_LENGTH, { error: `Message must be at most ${MESSAGE_MAX_LENGTH} characters` }),
})

export type RequestField = keyof z.infer<typeof requestSchema>

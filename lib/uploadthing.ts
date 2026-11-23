import { genUploader } from "uploadthing/client"
import type { FileRouter } from "uploadthing/types"

// The backend's router; the rewrite in next.config.ts sends it there with the auth cookie
export const { uploadFiles } = genUploader<FileRouter>({ url: "/api/uploadthing" })

// The backend's propertyImage route takes up to 2 images of 2 MB each
export const PROPERTY_IMAGE_MAX_COUNT = 2
export const PROPERTY_IMAGE_MAX_BYTES = 2 * 1024 * 1024

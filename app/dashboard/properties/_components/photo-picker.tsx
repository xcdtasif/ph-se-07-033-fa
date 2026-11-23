"use client"

import { ImagePlus, X } from "lucide-react"
import Image from "next/image"
import { useState, useSyncExternalStore, type ChangeEvent } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { PROPERTY_IMAGE_MAX_BYTES, PROPERTY_IMAGE_MAX_COUNT } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"

// Formats every browser can preview; others, like a phone's HEIC photos, would show broken
const IMAGE_TYPES = ["image/webp", "image/png", "image/jpeg"]

/*
Chrome on Android opens its photo picker for an input that takes only images, and files from it
often can't be read. Any other type makes it open the regular chooser instead, so Android also
takes any type, and anything that isn't WebP, PNG or JPG is turned away with a toast. Read on the
client only, so the server render and hydration both use the image-only list
*/
const IMAGE_ACCEPT = IMAGE_TYPES.join(",")
const ANDROID_ACCEPT = `${IMAGE_ACCEPT},*/*`
const subscribeNever = () => () => {}
const isAndroid = () => /Android/i.test(navigator.userAgent)

/*
The file's bytes in a new File, or null if it can't be read. Android's photo picker, if it opens
anyway, sometimes hands over a file the browser can't read; waiting doesn't help, picking it again
does
*/
const copyFile = async (file: File) => {
  try {
    return new File([await file.arrayBuffer()], file.name, { type: file.type })
  } catch {
    return null
  }
}

// The pill at the foot of an image: "Cover" on the first, "Set as cover" on the other
const COVER_PILL =
  "bg-card flex h-5 items-center justify-center rounded-4xl px-2 text-xs font-medium"

// An uploaded photo's URL, or a picked file with a preview URL until it's uploaded
export type Photo = { url: string; file?: File }

type PhotoPickerProps = {
  photos: Photo[]
  // Applied to the current images, which may have changed while a pick was being read
  onChange: (update: (photos: Photo[]) => Photo[]) => void
  invalid?: boolean
}

/*
Two 3:2 slots side by side across the form, the first image the cover. A filled slot shows the
image with a button to remove it, and the other image a button to make it the cover; an empty one
opens the file picker. Files over 2 MB, past the second, or in formats other than WebP, PNG and
JPG are turned away with a toast before anything uploads. While a pick is read the empty slot is
disabled, so a second pick can't slip in.
*/
export function PhotoPicker({ photos, onChange, invalid }: PhotoPickerProps) {
  /*
  A preview is released when its image is removed or uploaded. Not when the picker unmounts:
  Fast Refresh and Strict Mode re-run effects while the images stay, which would break them
  */
  const accept = useSyncExternalStore(
    subscribeNever,
    () => (isAndroid() ? ANDROID_ACCEPT : IMAGE_ACCEPT),
    () => IMAGE_ACCEPT,
  )
  const [inputKey, setInputKey] = useState(0)
  const [reading, setReading] = useState(false)
  const room = PROPERTY_IMAGE_MAX_COUNT - photos.length

  const add = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = [...(event.target.files ?? [])]
    const picked = files.filter((file) => IMAGE_TYPES.includes(file.type))
    const fitting = picked.filter((file) => file.size <= PROPERTY_IMAGE_MAX_BYTES)

    if (picked.length < files.length) {
      toast.error("Images must be WebP, PNG or JPG")
    } else if (fitting.length < picked.length) {
      toast.error("Each image must be 2 MB or smaller")
    } else if (fitting.length > room) {
      toast.error(`A property can have at most ${PROPERTY_IMAGE_MAX_COUNT} images`)
    }

    // Copied into memory, so the preview and the upload don't depend on the browser's handle to it
    setReading(true)
    const copies = await Promise.all(fitting.slice(0, room).map(copyFile))
    setReading(false)
    const readable = copies.filter((file) => file !== null)

    if (readable.length < copies.length) {
      toast.error("Couldn't read the image, please try again")
    }

    /*
    A fresh input for the next pick, so picking the same file again still counts as a change,
    without clearing this one and touching the file it holds
    */
    setInputKey((key) => key + 1)

    if (readable.length > 0) {
      const added = readable.map((file) => ({ file, url: URL.createObjectURL(file) }))

      onChange((current) => [...current, ...added].slice(0, PROPERTY_IMAGE_MAX_COUNT))
    }
  }

  const makeCover = (photo: Photo) => {
    onChange((current) => [photo, ...current.filter((other) => other.url !== photo.url)])
  }

  const remove = (photo: Photo) => {
    if (photo.file) URL.revokeObjectURL(photo.url)
    onChange((current) => current.filter((other) => other.url !== photo.url))
  }

  return (
    <ul className="grid grid-cols-2 gap-3">
      {photos.map((photo, index) => (
        <li key={photo.url} className="bg-muted relative aspect-3/2 overflow-hidden rounded-lg">
          {/* A picked file's preview is a blob URL, which the image optimizer can't fetch */}
          <Image
            src={photo.url}
            alt={`Image ${index + 1}`}
            fill
            unoptimized
            className="object-cover"
          />
          {/*
          The cover's label, or on the other image a button that moves it to the front. Centred
          by a full-width row rather than a transform, which can blur the text
          */}
          <div className="absolute inset-x-0 bottom-2 flex justify-center">
            {index === 0 ? (
              <span className={COVER_PILL}>Cover</span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(photo)}
                className={cn(
                  COVER_PILL,
                  "focus-visible:ring-ring/50 outline-none hover:brightness-95 focus-visible:ring-3",
                )}
              >
                Set as cover
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            onClick={() => remove(photo)}
            className="absolute top-2 right-2"
          >
            <X aria-hidden="true" />
            <span className="sr-only">Remove image {index + 1}</span>
          </Button>
        </li>
      ))}
      {room > 0 && (
        <li>
          <label
            className={cn(
              "text-muted-foreground has-focus-visible:ring-ring/50 hover:bg-muted/50 flex aspect-3/2 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-sm has-focus-visible:ring-3 has-disabled:pointer-events-none",
              invalid ? "border-destructive" : "border-foreground/25",
            )}
          >
            <ImagePlus className="size-5" aria-hidden="true" />
            Add image
            <input
              key={inputKey}
              type="file"
              accept={accept}
              multiple={room > 1}
              onChange={add}
              disabled={reading}
              aria-invalid={invalid}
              className="sr-only"
            />
          </label>
        </li>
      )}
    </ul>
  )
}

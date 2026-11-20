"use client"

import { ImageOff } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

const SIZES = "(min-width: 1024px) 704px, 100vw"

// The selected photo large, with a thumbnail per photo (even a single one) to switch between them
export function PropertyGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0)
  const image = images[selected]

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-muted relative aspect-3/2 overflow-hidden rounded-xl">
        {image ? (
          <Image
            src={image}
            alt={images.length > 1 ? `${name}, photo ${selected + 1} of ${images.length}` : name}
            fill
            sizes={SIZES}
            loading="eager"
            className="object-cover"
          />
        ) : (
          <ImageOff
            className="text-muted-foreground absolute inset-0 m-auto size-10"
            aria-label="No photo"
          />
        )}
        {images.length > 1 && (
          <span
            aria-hidden="true"
            className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white"
          >
            {selected + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 0 && (
        <ul className="flex gap-3">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={index === selected}
                className={cn(
                  "bg-muted focus-visible:ring-ring/50 relative block aspect-3/2 w-24 cursor-pointer overflow-hidden rounded-lg ring-2 ring-transparent outline-none focus-visible:ring-3 sm:w-32",
                  index === selected ? "ring-primary" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="128px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

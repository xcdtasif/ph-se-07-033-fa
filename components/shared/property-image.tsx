"use client"

import Image, { type ImageProps } from "next/image"
import { useState } from "react"

import { cn } from "@/lib/utils"

// The first of the placeholder photos the backend seeds properties with
export const PLACEHOLDER_IMAGE_URL =
  "https://o3vpd4m2kj.ufs.sh/f/PYLoyXR9oc720G4pCrhANkzH7hFodjsXCu3UOx2r8n1LDR5G"

type PropertyImageProps = Omit<ImageProps, "src" | "onError" | "onLoad"> & { src?: string }

/*
A property photo that falls back to the placeholder when it's missing or fails to load
(e.g. the file was deleted from UploadThing). If the placeholder fails too, it's left
out and the muted background behind it shows.

Nothing is shown until a photo has loaded, so a failed photo's broken-image icon never
flashes. When the photo changes (the gallery), the current one stays, fading after a
short delay, while a hidden copy loads the next; it swaps in once loaded. next/image also
reports photos that loaded before the page became interactive.
*/
export function PropertyImage({ src, alt, className, ...props }: PropertyImageProps) {
  const [failed, setFailed] = useState<string>()
  // The photo last loaded, which stays on screen until the next one is ready
  const [loaded, setLoaded] = useState<string>()
  const target = !src || failed === src ? PLACEHOLDER_IMAGE_URL : src
  const shown = loaded ?? target
  const switching = loaded !== undefined && loaded !== target

  // Nothing left to show: the photo and the placeholder both failed
  if (failed === PLACEHOLDER_IMAGE_URL && target === PLACEHOLDER_IMAGE_URL) {
    return null
  }

  return (
    <>
      <Image
        {...props}
        src={shown}
        alt={alt}
        className={cn(
          className,
          "transition-opacity",
          loaded === undefined && "opacity-0",
          switching && "opacity-50 delay-150",
        )}
        onLoad={() => setLoaded(shown)}
        onError={() => setFailed(shown)}
      />
      {switching && failed !== target && (
        // Eager, so it loads while hidden; same sizes, so it fetches the file shown next
        <Image
          {...props}
          src={target}
          alt=""
          loading="eager"
          className="hidden"
          onLoad={() => setLoaded(target)}
          onError={() => setFailed(target)}
        />
      )}
    </>
  )
}

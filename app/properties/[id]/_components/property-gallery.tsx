"use client"

import { XIcon } from "lucide-react"
import { useEffect, useRef, useState, type PointerEvent, type SyntheticEvent } from "react"

import { ActiveDot } from "@/components/shared/active-dot"
import { PropertyImage } from "@/components/shared/property-image"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const SIZES = "(min-width: 1024px) 704px, 100vw"

// How far a finger must move sideways to count as a swipe, in px
const SWIPE_DISTANCE = 40

/*
Touch swipe handlers: left calls onSwipe(1), right onSwipe(-1). Mouse drags are left
alone. The element needs touch-action: pan-y, so the page still scrolls up and down
while sideways moves reach these handlers. A swipe doesn't also count as a click.
*/
function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  return {
    onPointerDown(event: PointerEvent) {
      swiped.current = false
      start.current = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY }
    },
    onPointerUp(event: PointerEvent) {
      const from = start.current
      start.current = null

      if (!from) {
        return
      }

      const dx = event.clientX - from.x
      const dy = event.clientY - from.y

      if (Math.abs(dx) >= SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) {
        swiped.current = true
        onSwipe(dx < 0 ? 1 : -1)
      }
    },
    // The browser took over, e.g. to scroll the page
    onPointerCancel() {
      start.current = null
    },
    onClickCapture(event: SyntheticEvent) {
      if (swiped.current) {
        swiped.current = false
        event.preventDefault()
        event.stopPropagation()
      }
    },
  }
}

// The photo one step away; past the last comes the first, and before the first the last
const stepIndex = (index: number, direction: 1 | -1, count: number) =>
  (index + direction + count) % count

/*
Whether an arrow key press is free to change the photo: not while typing, not with a
modifier (browser shortcuts), and not inside another dialog over the page
*/
const isPhotoKey = (event: KeyboardEvent, inFullView: boolean) => {
  const target = event.target instanceof HTMLElement ? event.target : null

  return (
    (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
    !event.defaultPrevented &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !target?.closest("input, textarea, select, [contenteditable='true']") &&
    (inFullView || !target?.closest("[role='dialog']"))
  )
}

/*
The selected photo large, cropped to 3:2, with a thumbnail per photo (even a single
one) to switch between them. Clicking the large photo shows it whole. The left and
right arrow keys, or a swipe on touch screens, move to the previous or next photo,
looping round, on the page and in the full view.
*/
export function PropertyGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const image = images[selected]
  const alt = `${name}, photo ${selected + 1} of ${images.length}`
  const step = (direction: 1 | -1) =>
    setSelected((index) => stepIndex(index, direction, images.length))

  const swipe = useSwipe(step)

  /*
  On the window, so the keys work wherever focus is on the page or in the full view.
  Capture phase: the dialog stops key presses inside it from bubbling up to the window.
  */
  useEffect(() => {
    if (images.length < 2) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isPhotoKey(event, open)) {
        const direction = event.key === "ArrowLeft" ? -1 : 1
        setSelected((index) => stepIndex(index, direction, images.length))
      }
    }

    window.addEventListener("keydown", onKeyDown, { capture: true })

    return () => window.removeEventListener("keydown", onKeyDown, { capture: true })
  }, [open, images.length])

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View photo ${selected + 1} in full`}
        {...swipe}
        className="bg-muted focus-visible:ring-ring/50 relative aspect-3/2 cursor-zoom-in touch-pan-y overflow-hidden rounded-xl outline-none focus-visible:ring-3"
      >
        <PropertyImage
          src={image}
          alt={alt}
          fill
          sizes={SIZES}
          loading="eager"
          className="object-cover"
        />
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 flex h-6 items-center rounded-full bg-black/60 px-2.5 text-xs leading-none font-medium text-white tabular-nums"
        >
          {selected + 1} / {Math.max(images.length, 1)}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/*
        As wide and tall as the photo, within the screen. No background or ring: a
        background shows as a dark line round the photo's rounded corners on phones.
        It takes focus itself when it opens, so the close button doesn't, and an
        arrow key press doesn't light up its focus ring.
        */}
        <DialogContent
          ref={popupRef}
          initialFocus={popupRef}
          showCloseButton={false}
          {...swipe}
          className="w-auto max-w-none touch-pan-y overflow-hidden bg-transparent p-0 ring-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <PropertyImage
            src={image}
            alt={alt}
            width={1920}
            height={1920}
            sizes="100vw"
            className="h-auto max-h-[85vh] w-auto max-w-[calc(100vw-2rem)]"
          />
          <DialogClose className="absolute top-2 right-2 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none hover:bg-black/80">
            <XIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {images.length > 0 && (
        <ul className="flex gap-3">
          {images.map((src, index) => (
            // pb-2.5: room for the dot below the thumbnail, 1.5 gap + 1 dot
            <li key={src} className="relative pb-2.5">
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={index === selected}
                className={cn(
                  "bg-muted focus-visible:ring-ring/50 relative block aspect-3/2 w-24 cursor-pointer overflow-hidden rounded-lg outline-none focus-visible:ring-3 sm:w-32",
                  index !== selected && "opacity-70 hover:opacity-100",
                )}
              >
                {/*
                Eager like the large photo: visible right away, and the first one is the
                same file, which Next.js would otherwise report as a lazy LCP image
                */}
                <PropertyImage
                  src={src}
                  alt=""
                  fill
                  sizes="128px"
                  loading="eager"
                  className="object-cover"
                />
              </button>
              {/* Marks the photo on show; aria-pressed tells screen readers */}
              {index === selected && <ActiveDot />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

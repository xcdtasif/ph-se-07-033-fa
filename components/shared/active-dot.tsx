// The dot under the current item: the navbar page, the request status filter, the gallery photo
export function ActiveDot() {
  return (
    <span
      className="bg-foreground absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full"
      aria-hidden="true"
    />
  )
}

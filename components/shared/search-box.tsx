"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import { Input } from "@/components/ui/input"
import { NO_AUTOFILL } from "@/lib/form"
import { cn } from "@/lib/utils"

import { useFadeWhilePending } from "./scroll-link"

// Typing waits for a pause this long before searching; Enter searches at once
const TYPING_DELAY = 400

type SearchBoxProps = {
  // The input's id and accessible name, e.g. "Search users"
  id: string
  label: string
  placeholder: string
  // This page's URL for the current filter, from the first page, without a search
  href: string
  // The search in the URL
  search?: string
  // The id of the list it searches, faded while results load
  listId: string
  // E.g. full width in a narrow column, in place of the usual 24rem
  className?: string
}

// The URL for a search: `href` with `?search=` added, or `href` itself for an empty one
const searchHref = (href: string, search: string) => {
  const [path, query = ""] = href.split("?")
  const params = new URLSearchParams(query)

  if (search) {
    params.set("search", search)
  }

  const text = params.toString()

  return text ? `${path}?${text}` : path
}

/*
Searches as the admin types, replacing the URL so Back leaves the page instead of stepping
through each keystroke. The text is kept in state, not remounted per URL, so typing keeps focus
while results load; the list's current rows stay, faded, until the new ones arrive.
*/
export function SearchBox({
  id,
  label,
  placeholder,
  href,
  search = "",
  listId,
  className,
}: SearchBoxProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(search)
  // The search last sent to the URL, and the URL's search last seen
  const [applied, setApplied] = useState(search)
  const [seen, setSeen] = useState(search)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useFadeWhilePending(listId, pending)

  // Back, Forward or a link changed the URL: show its search, unless it's the one just typed
  if (search !== seen) {
    setSeen(search)

    if (search !== applied) {
      setValue(search)
      setApplied(search)
    }
  }

  // A pending search mustn't navigate after leaving the page
  useEffect(() => () => clearTimeout(timer.current), [])

  const apply = (text: string) => {
    clearTimeout(timer.current)
    const next = text.trim()

    if (next === search) {
      return
    }

    setApplied(next)
    startTransition(() => router.replace(searchHref(href, next), { scroll: false }))
  }

  return (
    <form
      role="search"
      className={cn("relative w-full max-w-sm", className)}
      onSubmit={(event) => {
        event.preventDefault()
        apply(value)
      }}
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        placeholder={placeholder}
        maxLength={100}
        {...NO_AUTOFILL}
        value={value}
        onChange={(event) => {
          const text = event.target.value
          setValue(text)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => apply(text), TYPING_DELAY)
        }}
        className="bg-card pl-8"
      />
    </form>
  )
}

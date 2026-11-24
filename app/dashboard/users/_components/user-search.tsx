"use client"

import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import { useFadeWhilePending } from "@/components/shared/scroll-link"
import { Input } from "@/components/ui/input"

import { usersHref, type UserFilter } from "./user-filter"

// Typing waits for a pause this long before searching; Enter searches at once
const TYPING_DELAY = 400

type UserSearchProps = {
  filter?: UserFilter
  // The search in the URL
  search?: string
}

/*
Searches names and emails as the admin types, replacing the URL so Back leaves the page instead
of stepping through each keystroke. The text is kept in state, not remounted per URL, so typing
keeps focus while results load; the table's current rows stay, faded, until the new ones arrive.
*/
export function UserSearch({ filter, search = "" }: UserSearchProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(search)
  // The search last sent to the URL, and the URL's search last seen
  const [applied, setApplied] = useState(search)
  const [seen, setSeen] = useState(search)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useFadeWhilePending("users", pending)

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
    startTransition(() =>
      router.replace(usersHref({ filter, search: next || undefined }), { scroll: false }),
    )
  }

  return (
    <form
      role="search"
      className="relative w-full max-w-sm"
      onSubmit={(event) => {
        event.preventDefault()
        apply(value)
      }}
    >
      <label htmlFor="user-search" className="sr-only">
        Search users
      </label>
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        id="user-search"
        type="search"
        placeholder="Search by name or email"
        maxLength={100}
        autoComplete="off"
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

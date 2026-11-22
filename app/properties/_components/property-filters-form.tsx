"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react"

import { SkeletonText } from "@/components/shared/skeleton-text"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatNumber } from "@/lib/format"
import type { Category } from "@/lib/types"
import { cn } from "@/lib/utils"

import {
  DEFAULT_SORT,
  MAX_RENT,
  SORT_OPTIONS,
  toQueryString,
  type PropertyFilters,
} from "../_schemas/property-filters"

type PropertyFiltersFormProps = {
  categories: Category[]
  filters: PropertyFilters
}

// The fields as typed; rent stays text so a box can be empty
type Values = {
  search: string
  categoryId: string | null
  minRent: string
  maxRent: string
  sort: string
}

const RENT_DIGITS = String(MAX_RENT).length
// Typing waits for a pause this long before applying; picking from a list applies at once
const TYPING_DELAY = 400

const EMPTY: Values = { search: "", categoryId: null, minRent: "", maxRent: "", sort: DEFAULT_SORT }

const toValues = (filters: PropertyFilters): Values => ({
  search: filters.search ?? "",
  categoryId: filters.categoryId ?? null,
  minRent: filters.minRent?.toString() ?? "",
  maxRent: filters.maxRent?.toString() ?? "",
  sort: filters.sort,
})

// Empty fields and defaults are left out (no `search=&minRent=` noise); a change starts from page 1
const toQuery = (values: Values) =>
  toQueryString({
    search: values.search.trim() || undefined,
    categoryId: values.categoryId ?? undefined,
    // Number() drops leading zeros, so 007 becomes 7
    minRent: values.minRent ? Number(values.minRent) : undefined,
    maxRent: values.maxRent ? Number(values.maxRent) : undefined,
    sort: values.sort,
    page: 1,
  })

// Digits only, capped at the max rent's length; a pasted 9.56 keeps the whole part, not 956
const toDigits = (event: ChangeEvent<HTMLInputElement>) =>
  event.target.value.split(".")[0].replace(/\D/g, "").slice(0, RENT_DIGITS)

/*
Filters live in the URL and apply as they change, replacing the URL so Back
leaves the page instead of stepping through each keystroke. The fields are kept
in state, not remounted per URL, so typing keeps focus while results load.
*/
export function PropertyFiltersForm({ categories, filters }: PropertyFiltersFormProps) {
  // null is "no category", which is left out of the URL
  const categoryItems = [
    { label: "All categories", value: null },
    ...categories.map((category) => ({ label: category.name, value: category.id })),
  ]
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [values, setValues] = useState(() => toValues(filters))
  const [rangeError, setRangeError] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  /*
  A URL this form didn't produce (Back/Forward, a pagination link) resets the
  fields to it. The form's own URL is skipped, or typing done while it loaded
  would be undone.
  */
  const urlQuery = toQueryString(filters)
  const [seenQuery, setSeenQuery] = useState(urlQuery)
  const [appliedQuery, setAppliedQuery] = useState(urlQuery)

  if (urlQuery !== seenQuery) {
    setSeenQuery(urlQuery)

    if (urlQuery !== appliedQuery) {
      setValues(toValues(filters))
      setAppliedQuery(urlQuery)
      setRangeError(false)
    }
  }

  // A pending apply mustn't navigate after leaving the page
  useEffect(() => () => clearTimeout(timer.current), [])

  const apply = (next: Values) => {
    clearTimeout(timer.current)

    if (next.minRent && next.maxRent && Number(next.minRent) > Number(next.maxRent)) {
      setRangeError(true)
      return
    }

    setRangeError(false)
    const query = toQuery(next)

    if (query === urlQuery) {
      return
    }

    setAppliedQuery(query)
    startTransition(() =>
      router.replace(query ? `/properties?${query}` : "/properties", { scroll: false }),
    )
  }

  const update = (change: Partial<Values>, delay = 0) => {
    const next = { ...values, ...change }
    setValues(next)
    clearTimeout(timer.current)

    if (delay) {
      timer.current = setTimeout(() => apply(next), delay)
    } else {
      apply(next)
    }
  }

  return (
    <form
      // Enter applies right away instead of waiting for the pause
      onSubmit={(event) => {
        event.preventDefault()
        apply(values)
      }}
      noValidate
      aria-busy={pending}
      aria-label="Filter properties"
      className="bg-card grid items-start gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="search">Search</FieldLabel>
        <Input
          id="search"
          name="search"
          type="search"
          placeholder="Name, location or description"
          maxLength={100}
          value={values.search}
          onChange={(event) => update({ search: event.target.value }, TYPING_DELAY)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="categoryId">Category</FieldLabel>
        <Select
          id="categoryId"
          items={categoryItems}
          value={values.categoryId}
          onValueChange={(categoryId) => update({ categoryId })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryItems.map((item) => (
              <SelectItem key={item.value ?? "all"} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field data-invalid={rangeError}>
        <FieldLabel htmlFor="minRent">Min rent (BDT)</FieldLabel>
        <Input
          id="minRent"
          name="minRent"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={values.minRent}
          onChange={(event) => update({ minRent: toDigits(event) }, TYPING_DELAY)}
          aria-invalid={rangeError}
          aria-describedby={rangeError ? "rent-error" : undefined}
        />
      </Field>

      <Field data-invalid={rangeError}>
        <FieldLabel htmlFor="maxRent">Max rent (BDT)</FieldLabel>
        <Input
          id="maxRent"
          name="maxRent"
          inputMode="numeric"
          autoComplete="off"
          placeholder={formatNumber(MAX_RENT)}
          value={values.maxRent}
          onChange={(event) => update({ maxRent: toDigits(event) }, TYPING_DELAY)}
          aria-invalid={rangeError}
          aria-describedby={rangeError ? "rent-error" : undefined}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="sort">Sort by</FieldLabel>
        <Select
          id="sort"
          items={SORT_OPTIONS}
          value={values.sort}
          onValueChange={(sort) => update({ sort: sort ?? DEFAULT_SORT })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* One message for the pair, across the whole form, so the grid doesn't jump */}
      {rangeError && (
        <FieldError id="rent-error" className="text-center sm:col-span-2 lg:col-span-6">
          Min rent can't be greater than the max rent
        </FieldError>
      )}

      <div className="flex justify-center sm:col-span-2 lg:col-span-6">
        <Button type="button" size="sm" className="text-sm" onClick={() => update(EMPTY)}>
          Clear filters
        </Button>
      </div>
    </form>
  )
}

// One field while it loads: its label line, then a box the height of the input
function FieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <SkeletonText className="w-24 text-sm leading-snug" />
      <div className="skeleton h-8 rounded-lg" />
    </div>
  )
}

// The form while the categories load: the same box, grid, fields and button row
export function PropertyFiltersFormSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-card grid items-start gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <FieldSkeleton className="sm:col-span-2" />
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
      <FieldSkeleton />
      <div className="flex justify-center sm:col-span-2 lg:col-span-6">
        <div className="skeleton h-7 w-24 rounded-lg" />
      </div>
    </div>
  )
}

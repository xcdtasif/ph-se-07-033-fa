"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition, type InputEvent, type SubmitEvent } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
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

import {
  DEFAULT_SORT,
  MAX_RENT,
  SORT_OPTIONS,
  type PropertyFilters,
} from "../_schemas/property-filters"

type PropertyFiltersFormProps = {
  categories: Category[]
  filters: PropertyFilters
}

const RENT_KEYS = new Set(["minRent", "maxRent"])
const RENT_DIGITS = String(MAX_RENT).length

/*
Filters live in the URL. Submitting builds the query from the non-empty fields
(so the URL has no `search=&minRent=` noise) and starts again from page 1.
*/
export function PropertyFiltersForm({ categories, filters }: PropertyFiltersFormProps) {
  // null is "no category"; it submits as an empty value, which is left out of the URL
  const categoryItems = [
    { label: "All categories", value: null },
    ...categories.map((category) => ({ label: category.name, value: category.id })),
  ]
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [rangeError, setRangeError] = useState(false)

  // Digits only, capped at the max rent's length, so a rent box can't hold an out-of-range value
  const keepDigits = (event: InputEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    // A pasted 9.56 keeps the whole part instead of becoming 956
    input.value = input.value.split(".")[0].replace(/\D/g, "").slice(0, RENT_DIGITS)
    setRangeError(false)
  }

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams()

    for (const [key, value] of new FormData(event.currentTarget)) {
      const text = String(value).trim()

      if (text && !(key === "sort" && text === DEFAULT_SORT)) {
        // Number() drops leading zeros, so 007 becomes 7
        params.set(key, RENT_KEYS.has(key) ? String(Number(text)) : text)
      }
    }

    const minRent = params.get("minRent")
    const maxRent = params.get("maxRent")

    if (minRent && maxRent && Number(minRent) > Number(maxRent)) {
      setRangeError(true)
      return
    }

    startTransition(() => router.push(params.size ? `/properties?${params}` : "/properties"))
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Filter properties"
      className="grid items-start gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="search">Search</FieldLabel>
        <Input
          id="search"
          name="search"
          type="search"
          placeholder="Name, location or description"
          maxLength={100}
          defaultValue={filters.search}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="categoryId">Category</FieldLabel>
        <Select
          id="categoryId"
          name="categoryId"
          items={categoryItems}
          defaultValue={filters.categoryId ?? null}
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
          defaultValue={filters.minRent}
          onInput={keepDigits}
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
          defaultValue={filters.maxRent}
          onInput={keepDigits}
          aria-invalid={rangeError}
          aria-describedby={rangeError ? "rent-error" : undefined}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="sort">Sort by</FieldLabel>
        <Select id="sort" name="sort" items={SORT_OPTIONS} defaultValue={filters.sort}>
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
          Max rent must be at least the min rent.
        </FieldError>
      )}

      <div className="flex justify-center gap-2 sm:col-span-2 lg:col-span-6">
        <Link href="/properties" className={buttonVariants({ variant: "outline" })}>
          Clear filters
        </Link>
        <Button type="submit" disabled={pending}>
          {pending ? "Applying…" : "Apply filters"}
        </Button>
      </div>
    </form>
  )
}

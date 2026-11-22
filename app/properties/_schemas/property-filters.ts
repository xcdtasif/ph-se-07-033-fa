import { z } from "zod"

export const PAGE_SIZE = 6

export const SORT_OPTIONS = [
  { value: "NEWEST", label: "Newest first" },
  { value: "RENT_ASC", label: "Rent: low to high" },
  { value: "RENT_DESC", label: "Rent: high to low" },
] as const

export const DEFAULT_SORT = "NEWEST"

// Whole taka only; the backend allows decimals, but no one filters rent by paisa
export const MAX_RENT = 999_999

const sortValues = SORT_OPTIONS.map((option) => option.value) as [string, ...string[]]
const rentSchema = z.coerce.number().int().min(0).max(MAX_RENT)

/*
Mirrors the backend's list query rules. Each invalid value is dropped on its
own (`catch`), so a hand-edited URL shows the rest of the filters instead of the
backend rejecting the whole list with a 400.
*/
const filtersSchema = z.object({
  search: z.string().trim().min(1).max(100).optional().catch(undefined),
  categoryId: z.uuid().optional().catch(undefined),
  minRent: rentSchema.optional().catch(undefined),
  maxRent: rentSchema.optional().catch(undefined),
  sort: z.enum(sortValues).catch(DEFAULT_SORT),
  page: z.coerce.number().int().min(1).catch(1),
})

export type PropertyFilters = z.output<typeof filtersSchema>

type SearchParams = Record<string, string | string[] | undefined>

// First value of a repeated param, with blank values treated as missing
const firstValue = (value: string | string[] | undefined) => {
  const first = Array.isArray(value) ? value[0] : value

  return first?.trim() ? first : undefined
}

export const parseFilters = (searchParams: SearchParams): PropertyFilters => {
  const raw = Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, firstValue(value)]),
  )
  const filters = filtersSchema.parse(raw)

  // The backend rejects a range that's the wrong way round, so drop it
  if (
    filters.minRent !== undefined &&
    filters.maxRent !== undefined &&
    filters.minRent > filters.maxRent
  ) {
    return { ...filters, minRent: undefined, maxRent: undefined }
  }

  return filters
}

// The query string for these filters, leaving out defaults so URLs stay short
export const toQueryString = (filters: PropertyFilters) => {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    const isDefault = (key === "sort" && value === DEFAULT_SORT) || (key === "page" && value === 1)

    if (value !== undefined && !isDefault) {
      params.set(key, String(value))
    }
  }

  return params.toString()
}

export const hasActiveFilters = ({ search, categoryId, minRent, maxRent }: PropertyFilters) =>
  [search, categoryId, minRent, maxRent].some((value) => value !== undefined)

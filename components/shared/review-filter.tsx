import { HIDDEN_PILL_COLORS } from "./hidden-badge"
import { StatusFilter } from "./status-filter"

// The admin's review filters; All (undefined) shows both
const REVIEW_FILTERS = ["VISIBLE", "HIDDEN"] as const

export type ReviewFilter = (typeof REVIEW_FILTERS)[number]

// `?status=` as a review filter, undefined (all) for anything else
export const parseReviewFilter = (value: string | string[] | undefined) =>
  REVIEW_FILTERS.find((filter) => filter === value)

export const reviewFilterLabel = (filter: ReviewFilter) =>
  filter === "HIDDEN" ? "Hidden" : "Visible"

// The backend's query for a filter
export const reviewFilterQuery = (filter?: ReviewFilter) =>
  filter ? `&isHidden=${filter === "HIDDEN"}` : ""

// Visible is see-through with a solid border, like the outline badge, so it shades like Hidden
const filterColors = (filter: ReviewFilter) =>
  filter === "HIDDEN"
    ? HIDDEN_PILL_COLORS
    : "border-border text-foreground border hover:bg-foreground/5"

type ReviewFilterStripProps = {
  filter?: ReviewFilter
  href: (filter?: ReviewFilter) => string
  listId: string
}

export function ReviewFilterStrip({ filter, href, listId }: ReviewFilterStripProps) {
  return (
    <StatusFilter
      label="Filter reviews by visibility"
      statuses={REVIEW_FILTERS}
      status={filter}
      href={href}
      statusLabel={reviewFilterLabel}
      statusColors={filterColors}
      listId={listId}
    />
  )
}

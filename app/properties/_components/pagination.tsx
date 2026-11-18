import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { toQueryString, type PropertyFilters } from "../_schemas/property-filters"

type PaginationProps = {
  filters: PropertyFilters
  totalPages: number
}

export function Pagination({ filters, totalPages }: PaginationProps) {
  const { page } = filters

  // A link to `target`, or a disabled look-alike when there's no such page
  const pageLink = (target: number, children: ReactNode) => {
    if (target < 1 || target > totalPages) {
      return (
        <span
          aria-disabled="true"
          className={cn(buttonVariants({ variant: "outline" }), "pointer-events-none opacity-50")}
        >
          {children}
        </span>
      )
    }

    const query = toQueryString({ ...filters, page: target })

    return (
      <Link
        href={query ? `/properties?${query}` : "/properties"}
        className={buttonVariants({ variant: "outline" })}
      >
        {children}
      </Link>
    )
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4">
      {pageLink(
        page - 1,
        <>
          <ChevronLeft aria-hidden="true" />
          Previous
        </>,
      )}
      <p className="text-muted-foreground text-sm">
        Page {page} of {totalPages}
      </p>
      {pageLink(
        page + 1,
        <>
          Next
          <ChevronRight aria-hidden="true" />
        </>,
      )}
    </nav>
  )
}

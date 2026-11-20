import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationProps = {
  page: number
  totalPages: number
  // The URL of a page, keeping the rest of the current query
  href: (page: number) => string
  label?: string
}

export function Pagination({ page, totalPages, href, label = "Pagination" }: PaginationProps) {
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

    return (
      <Link href={href(target)} className={buttonVariants({ variant: "outline" })}>
        {children}
      </Link>
    )
  }

  return (
    <nav aria-label={label} className="flex items-center justify-center gap-4">
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

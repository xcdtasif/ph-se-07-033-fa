import Link from "next/link"

import { ScrollFade } from "@/components/ui/scroll-fade"
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

import { ActiveDot } from "./active-dot"
import { requestStatusColors, requestStatusLabel } from "./request-status-badge"

// `?status=` as a request status, undefined (all) for anything else
export const parseRequestStatus = (value: string | string[] | undefined) =>
  REQUEST_STATUSES.find((status) => status === value)

type RequestStatusFilterProps = {
  // The selected status, undefined for all
  status?: RequestStatus
  // The URL that shows `status` (undefined for all), from the first page
  href: (status?: RequestStatus) => string
}

/*
One line of status pills in the badges' colours ("All" white with a thin ring), the selected
one with the dot under it. On a phone it scrolls sideways within the content width instead
of wrapping (ScrollFade).
*/
export function RequestStatusFilter({ status, href }: RequestStatusFilterProps) {
  const options = [undefined, ...REQUEST_STATUSES]

  return (
    <nav aria-label="Filter requests by status">
      <ScrollFade>
        <ul className="flex w-max gap-2">
          {options.map((option) => {
            const selected = option === status

            return (
              // Room under the pill for the dot
              <li key={option ?? "ALL"} className="relative pb-2">
                <Link
                  href={href(option)}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/50 flex h-7 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap outline-none hover:brightness-95 focus-visible:ring-3",
                    option
                      ? requestStatusColors(option)
                      : "bg-card text-foreground ring-foreground/15 ring-1 ring-inset",
                  )}
                >
                  {option ? requestStatusLabel(option) : "All"}
                </Link>
                {selected && <ActiveDot />}
              </li>
            )
          })}
        </ul>
      </ScrollFade>
    </nav>
  )
}

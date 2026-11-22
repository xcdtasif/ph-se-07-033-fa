import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { REQUEST_STATUSES, type RequestStatus } from "@/lib/types"

import { ActiveDot } from "./active-dot"
import { requestStatusLabel } from "./request-status-badge"

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
One line of status links; on a phone it scrolls sideways instead of wrapping,
reaching the screen edges past the page padding. No scrollbar: the right 3rem
fades out instead, hinting at more. The 3rem end padding matches it, so the last
link scrolls clear of the fade; on wider screens the links never reach it.
*/
export function RequestStatusFilter({ status, href }: RequestStatusFilterProps) {
  const options = [undefined, ...REQUEST_STATUSES]

  return (
    <nav
      aria-label="Filter requests by status"
      className="-mx-4 [scrollbar-width:none] overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)] pr-12 pl-4"
    >
      <ul className="flex w-max gap-1">
        {options.map((option) => {
          const selected = option === status

          return (
            <li key={option ?? "ALL"}>
              <Link
                href={href(option)}
                aria-current={selected ? "page" : undefined}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "relative text-sm",
                })}
              >
                {option ? requestStatusLabel(option) : "All"}
                {selected && <ActiveDot />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

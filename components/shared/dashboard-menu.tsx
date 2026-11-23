"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DashboardSection } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

/*
The desktop navbar's Dashboard link, opening the role's dashboard pages. Like the other navbar
links it's ghost, but with no dot: the menu marks the current page semibold, as in every vertical
list. The menu is centred under it.
*/
export function DashboardMenu({ sections }: { sections: DashboardSection[] }) {
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" })}>
        Dashboard
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-auto">
        {sections.map(({ href, label }) => {
          const current = href === pathname

          return (
            <DropdownMenuItem
              key={href}
              render={<Link href={href} aria-current={current ? "page" : undefined} />}
              className={cn("justify-center", current && "font-semibold")}
            >
              {label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

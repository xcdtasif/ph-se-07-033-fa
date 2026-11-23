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
The desktop navbar's Dashboard link, opening the role's dashboard pages: a ghost button with no
dot, its menu centred under it with the current page semibold.
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

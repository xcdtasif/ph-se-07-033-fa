"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { DashboardSection } from "@/lib/dashboard"
import { cn } from "@/lib/utils"

import { AuthLink } from "./auth-link"
import { HomeLink } from "./home-link"
import { LogoutButton } from "./logout-button"

type MobileMenuProps = {
  // The role's dashboard pages; none for a guest or a role without any yet
  sections: DashboardSection[]
  loggedIn: boolean
}

// Large links; the dashboard's pages, under it, a step smaller
const parentLink = buttonVariants({
  variant: "ghost",
  className: "h-auto px-3 py-1.5 text-lg font-normal",
})
const childLink = buttonVariants({
  variant: "ghost",
  className: "h-auto px-3 py-1 text-base font-normal",
})

// The navbar's menu button; the sheet's close button sits over it at the same size
export function MenuButton({ disabled }: { disabled?: boolean }) {
  const icon = (
    <>
      <Menu className="size-5" aria-hidden="true" />
      <span className="sr-only">Open menu</span>
    </>
  )

  // The placeholder while the session loads isn't inside a Sheet, so it can't be a trigger
  return disabled ? (
    <Button variant="ghost" size="icon" disabled>
      {icon}
    </Button>
  ) : (
    <SheetTrigger render={<Button variant="ghost" size="icon" />}>{icon}</SheetTrigger>
  )
}

/*
The navbar links and account buttons below desktop width, in a sheet from the right: 80% of
the screen, up to 20rem, with the rest blurred like behind a dialog. The links sit in the
middle, the current one semibold; the account buttons sit at the bottom under a dashed line, all
the same width. Dashboard's pages start folded and fold again once the sheet has closed.
*/
export function MobileMenu({ sections, loggedIn }: MobileMenuProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dashboardOpen, setDashboardOpen] = useState(false)

  const close = () => setOpen(false)

  const menuLink = (href: string, className: string, children: ReactNode) => {
    const current = href === pathname

    return (
      <Link
        href={href}
        onClick={close}
        aria-current={current ? "page" : undefined}
        className={cn(className, current && "font-semibold")}
      >
        {children}
      </Link>
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      // After the closing animation, so the pages don't fold while the sheet is still in view
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setDashboardOpen(false)
      }}
    >
      <MenuButton />
      <SheetContent
        showCloseButton={false}
        className="gap-0 data-[side=right]:w-4/5 data-[side=right]:max-w-xs data-[side=right]:sm:max-w-xs"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        {/*
        Laid out like the navbar: 3.5rem tall plus a 1px line, so the dashed line lines up with
        the navbar's bottom border and the close button sits exactly over the menu button. The
        content below keeps the same 1rem sides, so RentNest and the buttons line up.
        */}
        <div className="border-foreground/25 box-content flex h-14 items-center justify-between border-b border-dashed px-4">
          <HomeLink onClick={close} className="text-lg font-semibold" />
          <SheetClose render={<Button variant="ghost" size="icon" />}>
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close menu</span>
          </SheetClose>
        </div>
        <div className="flex flex-1 flex-col gap-6 px-4 py-6">
          <nav aria-label="Menu" className="flex flex-1 flex-col items-center justify-center gap-3">
            {menuLink("/properties", parentLink, "Properties")}
            {sections.length > 0 && (
              <div className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  aria-expanded={dashboardOpen}
                  aria-controls="menu-dashboard-pages"
                  onClick={() => setDashboardOpen((value) => !value)}
                  className={parentLink}
                >
                  Dashboard
                </button>
                {dashboardOpen && (
                  <ul id="menu-dashboard-pages" className="flex flex-col items-center gap-1">
                    {sections.map(({ href, label }) => (
                      <li key={href}>{menuLink(href, childLink, label)}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </nav>
          <div className="divider-dashed flex flex-col gap-2 pt-6">
            {loggedIn ? (
              <>
                <Link href="/profile" onClick={close} className={buttonVariants()}>
                  Profile
                </Link>
                <LogoutButton onLogout={close} />
              </>
            ) : (
              <>
                <AuthLink href="/login" onClick={close} className={buttonVariants()}>
                  Log in
                </AuthLink>
                <AuthLink
                  href="/signup"
                  onClick={close}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Sign up
                </AuthLink>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

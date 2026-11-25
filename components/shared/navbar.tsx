import Link from "next/link"
import { Suspense } from "react"

import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth-fetch"
import { DASHBOARD_SECTIONS, type DashboardSection } from "@/lib/dashboard"

import { AuthLink } from "./auth-link"
import { DashboardMenu } from "./dashboard-menu"
import { HomeLink } from "./home-link"
import { LogoutButton } from "./logout-button"
import { MenuButton, MobileMenu } from "./mobile-menu"
import { NavLink } from "./nav-link"
import { ThemeToggle } from "./theme-toggle"

// The role's dashboard pages, none for a guest. Reads the session, so callers sit inside <Suspense>.
async function readNavbarUser(): Promise<{ loggedIn: boolean; sections: DashboardSection[] }> {
  const result = await getCurrentUser()

  return result.success
    ? { loggedIn: true, sections: DASHBOARD_SECTIONS[result.data.role] }
    : { loggedIn: false, sections: [] }
}

// Desktop: Properties, then Dashboard for a role that has dashboard pages
async function NavbarLinks() {
  const { sections } = await readNavbarUser()

  return (
    <ul className="flex items-center gap-1">
      <li>
        <NavLink href="/properties">Properties</NavLink>
      </li>
      {sections.length > 0 && (
        <li>
          <DashboardMenu sections={sections} />
        </li>
      )}
    </ul>
  )
}

/*
Desktop: the theme toggle, then Log out and Profile, or Sign up and Log in. The toggle waits with
the buttons, so it appears where it stays instead of moving once they replace their placeholder
*/
async function NavbarAccount() {
  const { loggedIn } = await readNavbarUser()

  return loggedIn ? (
    <>
      <ThemeToggle />
      <LogoutButton />
      <Link href="/profile" className={buttonVariants()}>
        Profile
      </Link>
    </>
  ) : (
    <>
      <ThemeToggle />
      <AuthLink href="/signup" className={buttonVariants({ variant: "outline" })}>
        Sign up
      </AuthLink>
      <AuthLink href="/login" className={buttonVariants()}>
        Log in
      </AuthLink>
    </>
  )
}

// Below desktop width: the links and account buttons in a sheet
async function NavbarMobileMenu() {
  const { loggedIn, sections } = await readNavbarUser()

  return <MobileMenu loggedIn={loggedIn} sections={sections} />
}

/*
Desktop: the brand, the links centred together, the theme toggle and account buttons.
Smaller screens: the brand, the theme toggle and a menu button. The parts that depend on the
session stream in at the same size as their placeholders.
*/
export function Navbar() {
  return (
    <header className="bg-card sticky top-0 z-40 border-b">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 lg:grid lg:grid-cols-[1fr_auto_1fr]"
      >
        <HomeLink className="justify-self-start text-lg font-semibold" />
        {/* One skeleton for both links while the session loads */}
        <div className="hidden lg:block">
          <Suspense fallback={<div className="skeleton h-8 w-44 rounded-lg" aria-hidden="true" />}>
            <NavbarLinks />
          </Suspense>
        </div>
        <div className="hidden items-center gap-2 justify-self-end lg:flex">
          {/* As wide as the toggle and buttons: 184px logged in, 181px for a guest */}
          <Suspense fallback={<div className="skeleton h-8 w-46 rounded-lg" aria-hidden="true" />}>
            <NavbarAccount />
          </Suspense>
        </div>
        {/* The menu button's placeholder is its own size, so the toggle needn't wait for it */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <Suspense fallback={<MenuButton disabled />}>
            <NavbarMobileMenu />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}

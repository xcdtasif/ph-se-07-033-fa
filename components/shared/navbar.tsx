import { House } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth-fetch"

import { UserMenu } from "./user-menu"

// Reads the session, so it streams in behind the Suspense boundary below
async function NavbarAccount() {
  const result = await getCurrentUser()

  if (result.success) {
    const { name, email, role } = result.data

    return <UserMenu user={{ name, email, role }} />
  }

  return (
    <>
      <Link href="/login" className={buttonVariants({ variant: "outline" })}>
        Log in
      </Link>
      <Link href="/register" className={buttonVariants()}>
        Register
      </Link>
    </>
  )
}

export function Navbar() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 md:grid md:grid-cols-[1fr_auto_1fr]"
      >
        <Link href="/" className="flex items-center gap-2 justify-self-start font-semibold">
          <House className="text-primary size-5" aria-hidden="true" />
          RentNest
        </Link>
        {/* Sits beside the account links on mobile, centred on desktop */}
        <Link
          href="/properties"
          className={buttonVariants({ variant: "ghost", className: "ml-auto md:ml-0" })}
        >
          Properties
        </Link>
        <div className="flex items-center gap-2 justify-self-end">
          {/* Same height as the buttons, so the navbar doesn't shift when they arrive */}
          <Suspense fallback={<div className="bg-muted h-8 w-24 animate-pulse rounded-lg" />}>
            <NavbarAccount />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}

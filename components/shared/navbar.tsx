import { House } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4"
      >
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <House className="text-primary size-5" aria-hidden="true" />
          RentNest
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
            Sign in
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Register
          </Link>
        </div>
      </nav>
    </header>
  )
}

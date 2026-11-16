import { House } from "lucide-react"
import Link from "next/link"

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
      </nav>
    </header>
  )
}

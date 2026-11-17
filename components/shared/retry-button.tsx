"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"

// Re-renders the current page on the server, fetching its data again
export function RetryButton() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button onClick={() => startTransition(() => router.refresh())} disabled={pending}>
      {pending ? "Trying again…" : "Try again"}
    </Button>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

const POLL_INTERVAL_MS = 3000
// Two minutes; the webhook usually arrives within seconds
const POLL_LIMIT = 40

/*
The pending card's footer. Re-renders the page on the server every few seconds while the
payment is PENDING; the next check waits for the previous one to finish, so a slow server
never gets two at once. The page drops this component when the status changes. After the
last check it offers to start checking again.
*/
export function PaymentPoller() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [polls, setPolls] = useState(0)

  useEffect(() => {
    if (pending || polls >= POLL_LIMIT) {
      return
    }

    const timer = setTimeout(() => {
      setPolls((count) => count + 1)
      startTransition(() => router.refresh())
    }, POLL_INTERVAL_MS)

    return () => clearTimeout(timer)
  }, [pending, polls, router])

  if (polls < POLL_LIMIT) {
    // At the button's height, so the footer doesn't change size when it appears
    return (
      <p className="text-muted-foreground flex min-h-7 items-center text-sm">
        Checking for confirmation…
      </p>
    )
  }

  return (
    <Button size="sm" className="text-sm" onClick={() => setPolls(0)}>
      Check again
    </Button>
  )
}

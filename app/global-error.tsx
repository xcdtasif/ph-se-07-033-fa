"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

import "./globals.css"

// Replaces the root layout when it fails, so it renders its own html and body
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col items-center justify-center gap-4 p-4 text-center">
        <title>Something went wrong | RentNest</title>
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground max-w-md">
          RentNest couldn't load. Check your connection and try again.
        </p>
        <Button onClick={() => retry()}>Try again</Button>
      </body>
    </html>
  )
}

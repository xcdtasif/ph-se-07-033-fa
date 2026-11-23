import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Footer } from "@/components/shared/footer"
import { Navbar } from "@/components/shared/navbar"
import { Toaster } from "@/components/ui/sonner"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "RentNest",
    template: "%s | RentNest",
  },
  description: "Find and list properties with ease.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {/*
      The body is at least the screen's height as it is now, address bar shown or hidden, so
      the footer stays at the bottom of a short page on phones. Browser extensions add
      attributes to it before React loads, so its hydration warnings are off.
      */}
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">{children}</main>
        <Footer />
        {/* Offsets keep toasts below the sticky navbar; 3s instead of Sonner's 4s */}
        <Toaster
          theme="light"
          richColors
          position="top-center"
          duration={3000}
          offset={64}
          mobileOffset={{ top: 64 }}
        />
      </body>
    </html>
  )
}

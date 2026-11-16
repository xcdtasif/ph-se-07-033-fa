import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Footer } from "@/components/shared/footer"
import { Navbar } from "@/components/shared/navbar"

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
  description: "Find and list rental properties with ease.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      {/* Browser extensions add attributes to body before React loads */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <Navbar />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

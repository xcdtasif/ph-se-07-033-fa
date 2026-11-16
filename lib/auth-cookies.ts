import "server-only"
import { cookies } from "next/headers"

import { env } from "@/config/env"

const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"]

/*
Copies the backend's auth cookies onto this app's domain. The backend sends the
tokens only as Set-Cookie headers, and the browser never talks to it directly,
so the server action that called it has to set them here.

Returns true when both tokens were set.
*/
export const relayAuthCookies = async (setCookies: string[]): Promise<boolean> => {
  const cookieStore = await cookies()
  const relayed = new Set<string>()

  for (const header of setCookies) {
    const [pair = "", ...attributes] = header.split(";").map((part) => part.trim())
    const separator = pair.indexOf("=")
    const name = pair.slice(0, separator)
    const value = decodeURIComponent(pair.slice(separator + 1))

    if (!AUTH_COOKIE_NAMES.includes(name) || !value) {
      continue
    }

    const maxAge = attributes.find((attribute) => attribute.toLowerCase().startsWith("max-age="))

    cookieStore.set(name, value, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: maxAge ? Number(maxAge.slice("max-age=".length)) : undefined,
    })
    relayed.add(name)
  }

  return relayed.size === AUTH_COOKIE_NAMES.length
}

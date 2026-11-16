import "server-only"
import { cookies } from "next/headers"

import { env } from "@/config/env"

export const AUTH_COOKIE_NAMES = ["accessToken", "refreshToken"] as const

export type AuthCookie = {
  name: string
  value: string
  options: { httpOnly: true; secure: boolean; sameSite: "lax"; path: "/"; maxAge?: number }
}

/*
Reads the backend's auth cookies from its Set-Cookie headers, with the options
to store them under on this app's domain. Returns null unless both tokens are
there.
*/
export const parseAuthCookies = (setCookies: string[]): AuthCookie[] | null => {
  const parsed = new Map<string, AuthCookie>()

  for (const header of setCookies) {
    const [pair = "", ...attributes] = header.split(";").map((part) => part.trim())
    const separator = pair.indexOf("=")
    const name = pair.slice(0, separator)
    const value = decodeURIComponent(pair.slice(separator + 1))

    if (!AUTH_COOKIE_NAMES.some((authName) => authName === name) || !value) {
      continue
    }

    const maxAge = attributes.find((attribute) => attribute.toLowerCase().startsWith("max-age="))

    parsed.set(name, {
      name,
      value,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: maxAge ? Number(maxAge.slice("max-age=".length)) : undefined,
      },
    })
  }

  return parsed.size === AUTH_COOKIE_NAMES.length ? [...parsed.values()] : null
}

/*
Copies the backend's auth cookies onto this app's domain. The backend sends the
tokens only as Set-Cookie headers, and the browser never talks to it directly,
so the server action that called it has to set them here.

Returns true when both tokens were set.
*/
export const relayAuthCookies = async (setCookies: string[]): Promise<boolean> => {
  const authCookies = parseAuthCookies(setCookies)

  if (!authCookies) {
    return false
  }

  const cookieStore = await cookies()

  for (const { name, value, options } of authCookies) {
    cookieStore.set(name, value, options)
  }

  return true
}

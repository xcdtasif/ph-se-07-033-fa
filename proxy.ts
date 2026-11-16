import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { apiRequest } from "@/lib/api"
import { AUTH_COOKIE_NAMES, parseAuthCookies, type AuthCookie } from "@/lib/auth-cookies"
import { safeRedirectPath } from "@/lib/redirect"
import { USER_ROLES, type User, type UserRole } from "@/lib/types"

/*
Optimistic route guard. It reads the role from the access token without
verifying the signature (the secret stays on the backend), so it only decides
where to send the user. The backend still checks every request.
*/

const GUEST_ONLY_ROUTES = ["/login", "/register"]

// First match wins, so the role-specific dashboards come before `/dashboard`
const PROTECTED_ROUTES: { prefix: string; roles: readonly UserRole[] }[] = [
  { prefix: "/dashboard/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/landlord", roles: ["LANDLORD"] },
  { prefix: "/dashboard/tenant", roles: ["TENANT"] },
  { prefix: "/payments", roles: ["TENANT"] },
  { prefix: "/dashboard", roles: USER_ROLES },
  { prefix: "/profile", roles: USER_ROLES },
]

// Refresh a little early so the token doesn't expire while the page renders
const EXPIRY_MARGIN_MS = 10_000

const tokenPayloadSchema = z.object({ role: z.enum(USER_ROLES), exp: z.number() })

type Session = {
  role: UserRole | null
  // New tokens from a refresh, to store on the response
  refreshed?: AuthCookie[]
  // The refresh token was rejected, so both cookies are removed
  cleared?: boolean
}

const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`)

const roleHome = (role: UserRole) => `/dashboard/${role.toLowerCase()}`

// The role in an unexpired access token, or null
const roleFromToken = (token: string): UserRole | null => {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString())
    const parsed = tokenPayloadSchema.safeParse(payload)

    return parsed.success && parsed.data.exp * 1000 > Date.now() + EXPIRY_MARGIN_MS
      ? parsed.data.role
      : null
  } catch {
    return null
  }
}

const readSession = async (request: NextRequest): Promise<Session> => {
  const accessToken = request.cookies.get("accessToken")?.value
  const role = accessToken ? roleFromToken(accessToken) : null

  if (role) {
    return { role }
  }

  const refreshToken = request.cookies.get("refreshToken")?.value

  if (!refreshToken) {
    return { role: null }
  }

  const { result, setCookies } = await apiRequest<User>("/api/auth/refresh", {
    method: "POST",
    headers: { Cookie: `refreshToken=${refreshToken}` },
  })

  if (result.success) {
    const refreshed = parseAuthCookies(setCookies)

    if (refreshed) {
      return { role: result.data.role, refreshed }
    }
  }

  // 401: refresh token invalid or account gone, 403: account banned
  if (result.statusCode === 401 || result.statusCode === 403) {
    return { role: null, cleared: true }
  }

  // Backend unreachable or failing: treat as logged out for this request only
  return { role: null }
}

// Where to send the user instead of the requested page, or null to let them in
const redirectFor = (request: NextRequest, role: UserRole | null): URL | null => {
  const { pathname, search, searchParams } = request.nextUrl

  if (GUEST_ONLY_ROUTES.some((route) => matches(pathname, route))) {
    return role ? new URL(safeRedirectPath(searchParams.get("redirectTo")), request.url) : null
  }

  const rule = PROTECTED_ROUTES.find((route) => matches(pathname, route.prefix))

  if (!rule) {
    return null
  }

  if (!role) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`)

    return loginUrl
  }

  if (pathname === "/dashboard" || !rule.roles.includes(role)) {
    return new URL(roleHome(role), request.url)
  }

  return null
}

export async function proxy(request: NextRequest) {
  const { role, refreshed, cleared } = await readSession(request)
  const redirectUrl = redirectFor(request, role)

  // Update the request's cookies too, so this render already uses the new tokens
  for (const { name, value } of refreshed ?? []) {
    request.cookies.set(name, value)
  }

  if (cleared) {
    for (const name of AUTH_COOKIE_NAMES) {
      request.cookies.delete(name)
    }
  }

  const response = redirectUrl
    ? NextResponse.redirect(redirectUrl)
    : NextResponse.next({ request: { headers: request.headers } })

  for (const { name, value, options } of refreshed ?? []) {
    response.cookies.set(name, value, options)
  }

  if (cleared) {
    for (const name of AUTH_COOKIE_NAMES) {
      response.cookies.set(name, "", { path: "/", maxAge: 0 })
    }
  }

  return response
}

export const config = {
  // Every page, but not API routes, Next.js assets or files with an extension
  matcher: ["/((?!api/|_next/static|_next/image|.*\\..*).*)"],
}

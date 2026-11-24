import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

import { apiFetch, apiRequest } from "@/lib/api"
import { AUTH_COOKIE_NAMES, parseAuthCookies, type AuthCookie } from "@/lib/auth-cookies"
import { DASHBOARD_SECTIONS } from "@/lib/dashboard"
import { safeRedirectPath } from "@/lib/redirect"
import { USER_ROLES, type User, type UserRole } from "@/lib/types"

/*
Optimistic route guard. It reads the role from the access token without
verifying the signature (the secret stays on the backend), so it only decides
where to send the user. The backend still checks every request.
*/

const GUEST_ONLY_ROUTES = ["/login", "/signup"]

// Which roles may open each protected path; the dashboard's pages are checked per role below
const PROTECTED_ROUTES: { prefix: string; roles: readonly UserRole[] }[] = [
  { prefix: "/payments", roles: ["TENANT"] },
  { prefix: "/dashboard", roles: USER_ROLES },
  { prefix: "/profile", roles: USER_ROLES },
]

/*
Dashboard pages that several roles share at one URL. Each role's version is its own page at
`<path>/<role>` (e.g. `/dashboard/requests/landlord`), which the proxy shows in place of the
shared URL, so each prerenders a loading state that matches its own content
*/
const ROLE_PAGES = ["/dashboard/overview", "/dashboard/requests"]

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

// The role's first dashboard page, or its profile while it has none
const roleHome = (role: UserRole) => DASHBOARD_SECTIONS[role][0]?.href ?? "/profile"

// `/dashboard` itself, or a dashboard page the role doesn't have
const isOtherDashboard = (pathname: string, role: UserRole) =>
  matches(pathname, "/dashboard") &&
  !DASHBOARD_SECTIONS[role].some((section) => matches(pathname, section.href))

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

const isGuestOnly = (pathname: string) =>
  GUEST_ONLY_ROUTES.some((route) => matches(pathname, route))

/*
Asks the backend whether the access token's account still exists and isn't
banned. Without this, a deleted or banned user with an unexpired token would be
sent away from the login page while the navbar (which asks the backend) offers
only "Log in", leaving no way to log in or out until the token expires.
*/
const confirmAccessToken = async (accessToken: string, role: UserRole): Promise<Session> => {
  const result = await apiFetch<User>("/api/users/me", {
    headers: { Cookie: `accessToken=${accessToken}` },
  })

  if (result.success) {
    return { role: result.data.role }
  }

  // 401: account gone or token rejected, 403: account banned
  if (result.statusCode === 401 || result.statusCode === 403) {
    return { role: null, cleared: true }
  }

  // Backend unreachable or failing: keep trusting the token
  return { role }
}

const readSession = async (request: NextRequest): Promise<Session> => {
  const accessToken = request.cookies.get("accessToken")?.value
  const role = accessToken ? roleFromToken(accessToken) : null

  if (accessToken && role) {
    // Only where the token would lock the user out; elsewhere the page asks the backend anyway
    return isGuestOnly(request.nextUrl.pathname) ? confirmAccessToken(accessToken, role) : { role }
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

  // A role's own version is reached through the shared URL only
  const shared = ROLE_PAGES.find((page) => pathname.startsWith(`${page}/`))

  if (shared) {
    return new URL(`${shared}${search}`, request.url)
  }

  if (isGuestOnly(pathname)) {
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

  if (!rule.roles.includes(role) || isOtherDashboard(pathname, role)) {
    return new URL(roleHome(role), request.url)
  }

  return null
}

// The role's own version of a shared page, or null to show the requested page
const rewriteFor = (request: NextRequest, role: UserRole | null): URL | null => {
  const { pathname, search } = request.nextUrl

  return role && ROLE_PAGES.includes(pathname)
    ? new URL(`${pathname}/${role.toLowerCase()}${search}`, request.url)
    : null
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

  const rewriteUrl = redirectUrl ? null : rewriteFor(request, role)
  const response = redirectUrl
    ? NextResponse.redirect(redirectUrl)
    : rewriteUrl
      ? NextResponse.rewrite(rewriteUrl, { request: { headers: request.headers } })
      : NextResponse.next({ request: { headers: request.headers } })

  for (const { name, value, options } of refreshed ?? []) {
    response.cookies.set(name, value, options)
  }

  if (cleared) {
    for (const name of AUTH_COOKIE_NAMES) {
      // Expires in the past rather than Max-Age=0, which Next drops when it passes cookies to the render
      response.cookies.delete({ name, path: "/" })
    }
  }

  return response
}

export const config = {
  // Every page, but not API routes, Next.js assets or files with an extension
  matcher: ["/((?!api/|_next/static|_next/image|.*\\..*).*)"],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Identify active sessions via cookies
  const hasAuthToken = request.cookies.has("fb-access-token")
  const hasGuestToken = request.cookies.has("green-hero-guest-active")
  const hasSession = hasAuthToken || hasGuestToken
  const hasOnboarded = request.cookies.has("green-hero-onboarded")

  // 2. Define path classifications
  const isProtectedPath = ["/dashboard", "/progress", "/rewards", "/profile", "/onboarding"].some((path) =>
    pathname.startsWith(path)
  )

  // 3. Redirection rules
  // If user has no active session and tries to access protected content -> redirect to Splash welcome
  if (isProtectedPath && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // If user has an active session but has NOT onboarded, force them to '/onboarding' (unless they are already there or on auth)
  if (hasSession && !hasOnboarded && pathname !== "/onboarding" && pathname !== "/auth") {
    const url = request.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  // If user is trying to access /auth, only redirect if they are fully authenticated
  if (pathname === "/auth") {
    if (hasAuthToken) {
      const url = request.nextUrl.clone()
      url.pathname = hasOnboarded ? "/dashboard" : "/onboarding"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // If user is trying to access splash page (/), redirect if they have any session
  if (pathname === "/") {
    if (hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = hasOnboarded ? "/dashboard" : "/onboarding"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

// Ensure middleware matches Next.js standard App Router matching specs
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest.json, images)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp).*)",
  ],
}

import { type NextRequest, NextResponse } from "next/server"

const PROTECTED_PREFIXES = ["/projects", "/editor", "/settings", "/chat"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If already logged in and visiting landing or auth pages, redirect away
  if (token && (pathname === "/" || pathname === "/login" || pathname === "/register")) {
    const dest = pathname === "/" ? "/chat" : "/projects"
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - /api/* (API routes handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
}

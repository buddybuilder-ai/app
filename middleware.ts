import { type NextRequest, NextResponse } from "next/server"

const PROTECTED_PREFIXES = ["/dashboard", "/projects", "/editor"]
const PUBLIC_PATHS = ["/login", "/register", "/"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If already logged in and visiting auth pages, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
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

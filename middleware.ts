import { type NextRequest, NextResponse } from "next/server"

const PROTECTED_PREFIXES = ["/projects", "/editor", "/settings", "/chat"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("access_token")?.value

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  // Unauthenticated access to protected routes → send back to landing (which hosts the auth modal)
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Already logged in → landing page redirects to the app
  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/chat", request.url))
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

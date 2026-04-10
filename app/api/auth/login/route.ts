import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  const body = await request.json()

  const upstream = await fetch(`${FASTAPI_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    const error = await upstream.json().catch(() => ({ detail: "Login failed" }))
    return NextResponse.json(error, { status: upstream.status })
  }

  const data = await upstream.json()
  const token: string = data.access_token

  const response = NextResponse.json(data)
  response.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
  return response
}

import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

function forwardHeaders(request: NextRequest): HeadersInit {
  const token = request.cookies.get("access_token")?.value
  const headers: HeadersInit = { "Content-Type": "application/json" }
  if (token) headers["Cookie"] = `access_token=${token}`
  return headers
}

export async function GET(request: NextRequest) {
  const resp = await fetch(`${FASTAPI_URL}/api/v1/conversations`, {
    headers: forwardHeaders(request),
  }).catch(() => null)
  if (!resp) return NextResponse.json({ detail: "Backend unavailable" }, { status: 503 })
  const data = await resp.json()
  return NextResponse.json(data, { status: resp.status })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const resp = await fetch(`${FASTAPI_URL}/api/v1/conversations`, {
    method: "POST",
    headers: forwardHeaders(request),
    body: JSON.stringify(body),
  }).catch(() => null)
  if (!resp) return NextResponse.json({ detail: "Backend unavailable" }, { status: 503 })
  const data = await resp.json()
  return NextResponse.json(data, { status: resp.status })
}

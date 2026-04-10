import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

function authHeaders(request: NextRequest): HeadersInit {
  const token = request.cookies.get("access_token")?.value
  return {
    "Content-Type": "application/json",
    ...(token ? { Cookie: `access_token=${token}` } : {}),
  }
}

export async function GET(request: NextRequest) {
  const upstream = await fetch(`${FASTAPI_URL}/api/v1/projects`, {
    headers: authHeaders(request),
  })
  return NextResponse.json(await upstream.json(), { status: upstream.status })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const upstream = await fetch(`${FASTAPI_URL}/api/v1/projects`, {
    method: "POST",
    headers: authHeaders(request),
    body: JSON.stringify(body),
  })
  return NextResponse.json(await upstream.json(), { status: upstream.status })
}

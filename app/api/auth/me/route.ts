import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 })
  }

  const upstream = await fetch(`${FASTAPI_URL}/api/v1/auth/me`, {
    headers: { Cookie: `access_token=${token}` },
  })

  if (!upstream.ok) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json(await upstream.json())
}

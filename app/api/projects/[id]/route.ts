import { type NextRequest, NextResponse } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

function authHeaders(request: NextRequest): HeadersInit {
  const token = request.cookies.get("access_token")?.value
  return {
    "Content-Type": "application/json",
    ...(token ? { Cookie: `access_token=${token}` } : {}),
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const upstream = await fetch(`${FASTAPI_URL}/api/v1/projects/${id}`, {
    headers: authHeaders(request),
  })
  return NextResponse.json(await upstream.json(), { status: upstream.status })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const upstream = await fetch(`${FASTAPI_URL}/api/v1/projects/${id}`, {
    method: "PATCH",
    headers: authHeaders(request),
    body: JSON.stringify(body),
  })
  return NextResponse.json(await upstream.json(), { status: upstream.status })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const upstream = await fetch(`${FASTAPI_URL}/api/v1/projects/${id}`, {
    method: "DELETE",
    headers: authHeaders(request),
  })
  return new NextResponse(null, { status: upstream.status })
}

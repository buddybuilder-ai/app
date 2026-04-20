import { type NextRequest } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

// Generating an image can take 30–90s, so allow a longer response window.
export const maxDuration = 120

export async function POST(request: NextRequest) {
  const body = await request.json()
  const upstream = await fetch(`${FASTAPI_URL}/api/v1/render/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
  })
}

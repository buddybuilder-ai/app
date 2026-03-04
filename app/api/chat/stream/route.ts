import { type NextRequest } from "next/server"

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000"

/**
 * SSE proxy route for the intent-aware chat stream.
 *
 * Forwards the request to FastAPI's /api/v1/chat/stream
 * and streams SSE events back to the browser.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()

  const upstream = await fetch(`${FASTAPI_URL}/api/v1/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "Backend error")
    return new Response(text, { status: upstream.status })
  }

  if (!upstream.body) {
    return new Response("No stream from backend", { status: 502 })
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}

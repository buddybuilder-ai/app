import { ChatResponseSchema } from "@/types/schemas/chat"
import { FengShuiLayoutResponseSchema } from "@/types/schemas/layout"
import type { ChatRequest, ChatResponse } from "@/types/chat"
import type {
  FengShuiLayoutRequest,
  FengShuiLayoutResponse,
} from "@/types/layout-api"

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error")
    throw new ApiError(text, res.status)
  }

  return res.json()
}

export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  const data = await post("/api/chat", request)
  const parsed = ChatResponseSchema.safeParse(data)

  if (!parsed.success) {
    console.error("Chat response validation failed:", parsed.error.flatten())
    throw new Error("Invalid chat response from server")
  }

  return parsed.data
}

export async function generateFengShuiLayout(
  request: FengShuiLayoutRequest
): Promise<FengShuiLayoutResponse> {
  const data = await post("/api/layout/feng-shui", request)
  const parsed = FengShuiLayoutResponseSchema.safeParse(data)

  if (!parsed.success) {
    console.error("Layout response validation failed:", parsed.error.flatten())
    throw new Error("Invalid layout response from server")
  }

  return parsed.data
}

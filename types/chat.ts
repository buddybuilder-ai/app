import type { z } from "zod"
import type { ChatModeSchema } from "./schemas/common"
import type {
  ChatRequestSchema,
  ChatResponseSchema,
  SourceDocumentSchema,
} from "./schemas/chat"
import type { PlacedFurnitureItem } from "./editor"

export type ChatMode = z.infer<typeof ChatModeSchema>
export type ChatRequest = z.infer<typeof ChatRequestSchema>
export type ChatResponse = z.infer<typeof ChatResponseSchema>
export type SourceDocument = z.infer<typeof SourceDocumentSchema>

export interface ReasoningStep {
  label: string
  content: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  mode: ChatMode
  timestamp: Date
  sources?: SourceDocument[]
  layoutAction?: LayoutActionData
  reasoning?: string
  reasoningSteps?: ReasoningStep[]
  isThinking?: boolean
}

export interface LayoutActionData {
  type: "apply_layout"
  payload: PlacedFurnitureItem[]
}

import { z } from "zod"
import { ChatModeSchema } from "./common"

export const SourceDocumentSchema = z.object({
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const ChatRequestSchema = z.object({
  text: z.string().min(1, "Message cannot be empty"),
  mode: ChatModeSchema,
})

export const ChatResponseSchema = z.object({
  answer: z.string(),
  source_documents: z.array(SourceDocumentSchema).default([]),
})

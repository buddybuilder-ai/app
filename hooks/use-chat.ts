"use client"

import { useCallback } from "react"
import { useChatStore } from "@/stores/chat-store"
import { sendChatMessage } from "@/lib/api-client"

export function useChat() {
  const addMessage = useChatStore((s) => s.addMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const mode = useChatStore((s) => s.mode)

  const send = useCallback(
    async (text: string) => {
      setLoading(true)

      try {
        const response = await sendChatMessage({ text, mode })

        addMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          mode,
          timestamp: new Date(),
          sources: response.source_documents,
        })
      } catch (error) {
        addMessage({
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : "Something went wrong. Please try again.",
          mode,
          timestamp: new Date(),
        })
      } finally {
        setLoading(false)
      }
    },
    [addMessage, setLoading, mode]
  )

  return { send }
}

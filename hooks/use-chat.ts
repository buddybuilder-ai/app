"use client"

import { useCallback } from "react"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import { getMockChatResponse } from "@/lib/mock-chat"

export function useChat() {
  const addMessage = useChatStore((s) => s.addMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const mode = useChatStore((s) => s.mode)
  const setFengShuiScore = useEditorStore((s) => s.setFengShuiScore)

  const send = useCallback(
    async (text: string) => {
      setLoading(true)

      try {
        const response = await getMockChatResponse(text, mode)

        // Store feng shui score for the panel
        setFengShuiScore(response.fengShuiScore)

        addMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          mode,
          timestamp: new Date(),
          layoutAction: {
            type: "apply_layout",
            payload: response.items,
          },
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
    [addMessage, setLoading, setFengShuiScore, mode]
  )

  return { send }
}

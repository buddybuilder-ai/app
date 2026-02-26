"use client"

import { useCallback } from "react"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import { getMockChatResponse } from "@/lib/mock-chat"

const STEP_DELAY = 800 // ms between each reasoning step

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function useChat() {
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const mode = useChatStore((s) => s.mode)
  const setFengShuiScore = useEditorStore((s) => s.setFengShuiScore)

  const send = useCallback(
    async (text: string) => {
      setLoading(true)

      try {
        const response = await getMockChatResponse(text, mode)
        const messageId = `assistant-${Date.now()}`

        // 1) Add a "thinking" message with no steps yet
        addMessage({
          id: messageId,
          role: "assistant",
          content: "",
          mode,
          timestamp: new Date(),
          isThinking: true,
          reasoning: response.reasoning,
          reasoningSteps: [],
        })

        // 2) Progressively reveal each reasoning step
        if (response.reasoningSteps) {
          for (let i = 0; i < response.reasoningSteps.length; i++) {
            await delay(STEP_DELAY)
            const revealedSteps = response.reasoningSteps.slice(0, i + 1)
            updateMessage(messageId, {
              reasoningSteps: revealedSteps,
            })
          }
        }

        // 3) Small pause before showing the final answer
        await delay(400)

        // 4) Reveal the full answer + remove thinking state
        setFengShuiScore(response.fengShuiScore)
        updateMessage(messageId, {
          content: response.answer,
          isThinking: false,
          reasoningSteps: response.reasoningSteps,
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
    [addMessage, updateMessage, setLoading, setFengShuiScore, mode]
  )

  return { send }
}

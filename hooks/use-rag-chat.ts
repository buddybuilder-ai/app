"use client"

import { useCallback, useRef } from "react"
import { useChatStore } from "@/stores/chat-store"

/**
 * RAG-only chat hook — ใช้กับหน้า /chat โดยเฉพาะ
 * เรียก /api/chat/rag (ไม่มี layout pipeline)
 */
export function useRagChat() {
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const mode = useChatStore((s) => s.mode)
  const messages = useChatStore((s) => s.messages)

  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(
    async (text: string) => {
      setLoading(true)

      const messageId = `assistant-${Date.now()}`
      addMessage({
        id: messageId,
        role: "assistant",
        content: "",
        mode,
        timestamp: new Date(),
        isThinking: true,
      })

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const conversationHistory = messages
          .filter((m) => m.content)
          .map((m) => ({ role: m.role, content: m.content }))

        const response = await fetch("/api/chat/rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            mode,
            conversation_history: conversationHistory,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errText = await response.text().catch(() => "Unknown error")
          throw new Error(`Chat request failed: ${errText}`)
        }

        if (!response.body) throw new Error("No response body")

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6))
                if (event.type === "answer") {
                  updateMessage(messageId, {
                    content: event.answer as string,
                    isThinking: false,
                  })
                }
              } catch {
                // skip malformed
              }
            }
          }
        }

        updateMessage(messageId, { isThinking: false })
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const errMsg = err instanceof Error ? err.message : "Something went wrong"
        updateMessage(messageId, { content: `Error: ${errMsg}`, isThinking: false })
      } finally {
        setLoading(false)
      }
    },
    [addMessage, updateMessage, setLoading, mode, messages]
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { send, cancel }
}

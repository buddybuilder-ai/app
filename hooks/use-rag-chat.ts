"use client"

import { useCallback, useRef } from "react"
import { useChatStore } from "@/stores/chat-store"

function updateConversationTitle(cid: string, text: string) {
  const title = text.length > 40 ? text.slice(0, 40) + "…" : text
  fetch(`/api/conversations/${cid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  }).then(() => {
    // Update title in store
    const { conversations, setConversations } = useChatStore.getState()
    setConversations(conversations.map((c) => c.id === cid ? { ...c, title } : c))
  }).catch(() => {/* silent */})
}

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
  const conversationId = useChatStore((s) => s.conversationId)

  const persistMessage = (role: "user" | "assistant", content: string) => {
    const cid = useChatStore.getState().conversationId
    if (!cid || !content) return
    fetch(`/api/conversations/${cid}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content, intent: null }),
    }).catch(() => {/* silent */})
  }

  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(
    async (text: string) => {
      setLoading(true)

      // Persist user message (fire-and-forget)
      persistMessage("user", text)

      // Auto-title: update on the first user message (exactly 1 user msg in store = this one)
      const cid = useChatStore.getState().conversationId
      const { conversations, messages: currentMessages } = useChatStore.getState()
      const conv = conversations.find((c) => c.id === cid)
      const userMsgCount = currentMessages.filter((m) => m.role === "user").length
      if (cid && conv && userMsgCount === 1) {
        updateConversationTitle(cid, text)
      }

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
            if (!line.startsWith("data: ")) continue
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === "answer_delta" && typeof event.delta === "string") {
                // Append each token as it arrives — the visible "typing" effect.
                const current = useChatStore.getState().messages.find((m) => m.id === messageId)
                const next = (current?.content ?? "") + event.delta
                updateMessage(messageId, { content: next, isThinking: false })
              } else if (event.type === "answer" && typeof event.answer === "string") {
                // Terminal event — reconcile to the authoritative full answer.
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

        updateMessage(messageId, { isThinking: false })
        const assistantContent = useChatStore.getState().messages.find((m) => m.id === messageId)?.content
        if (assistantContent) persistMessage("assistant", assistantContent)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const errMsg = err instanceof Error ? err.message : "Something went wrong"
        updateMessage(messageId, { content: `Error: ${errMsg}`, isThinking: false })
      } finally {
        setLoading(false)
      }
    },
    [addMessage, updateMessage, setLoading, mode, messages, conversationId]
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { send, cancel }
}

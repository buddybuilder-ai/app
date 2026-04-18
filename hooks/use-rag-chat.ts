"use client"

import { useCallback, useRef } from "react"
import { useChatStore, type ConversationMeta } from "@/stores/chat-store"

/**
 * Lazily create a conversation row in the DB. Seeds the title with the
 * user's first message so the sidebar never shows an empty "การสนทนาใหม่"
 * (mirrors ChatGPT / Claude.ai behavior).
 */
async function createConversation(firstMessage: string): Promise<string | null> {
  const title =
    firstMessage.length > 40 ? firstMessage.slice(0, 40) + "…" : firstMessage
  try {
    const resp = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    })
    if (!resp.ok) return null
    const conv: ConversationMeta = await resp.json()
    const { addConversation, setConversationId } = useChatStore.getState()
    addConversation({ ...conv, title })
    setConversationId(conv.id)
    return conv.id
  } catch {
    return null
  }
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

      // Lazy-create the conversation on the first send of a "new chat",
      // so the sidebar never shows an empty row. Title is seeded from
      // the first user message directly — no separate PATCH needed.
      let cid = useChatStore.getState().conversationId
      if (!cid) {
        cid = await createConversation(text)
      }

      // Persist user message (fire-and-forget)
      persistMessage("user", text)

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

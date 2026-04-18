"use client"

import { useCallback, useEffect } from "react"
import { useChatStore } from "@/stores/chat-store"
import type { ConversationMeta } from "@/stores/chat-store"

export type { ConversationMeta }

export function useConversations(kind: "general" | "project" | null = "general") {
  const conversations = useChatStore((s) => s.conversations)
  const setConversations = useChatStore((s) => s.setConversations)
  const removeConversation = useChatStore((s) => s.removeConversation)
  const setConversationId = useChatStore((s) => s.setConversationId)
  const conversationId = useChatStore((s) => s.conversationId)
  const setMessages = useChatStore((s) => s.setMessages)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const fetchList = useCallback(async () => {
    try {
      const url = kind ? `/api/conversations?kind=${kind}` : "/api/conversations"
      const resp = await fetch(url)
      if (!resp.ok) {
        console.warn("[useConversations] fetchList failed:", resp.status, resp.statusText)
        return
      }
      const data: ConversationMeta[] = await resp.json()
      console.log("[useConversations] fetched conversations:", data.length)
      setConversations(data)
    } catch (err) {
      console.error("[useConversations] fetchList error:", err)
    }
  }, [setConversations, kind])

  useEffect(() => {
    // Read directly from store (not closure) to avoid stale value
    const current = useChatStore.getState().conversations
    if (current.length === 0) {
      fetchList()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadMessages = useCallback(
    async (convId: string) => {
      try {
        const resp = await fetch(`/api/conversations/${convId}/messages`)
        if (!resp.ok) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msgs: any[] = await resp.json()
        setMessages(
          msgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            mode: "buddy" as const,
            timestamp: new Date(m.created_at),
          }))
        )
      } catch {
        // silent
      }
    },
    [setMessages]
  )

  const switchConversation = useCallback(
    async (convId: string) => {
      setConversationId(convId)
      await loadMessages(convId)
    },
    [setConversationId, loadMessages]
  )

  /**
   * "New chat" — reset client state only. The conversation row is created
   * lazily by useRagChat.send() when the user actually sends the first
   * message (matches ChatGPT / Claude.ai pattern: no empty rows in DB).
   */
  const newConversation = useCallback(async () => {
    setConversationId(null)
    clearMessages()
  }, [setConversationId, clearMessages])

  const deleteConversation = useCallback(
    async (convId: string) => {
      try {
        await fetch(`/api/conversations/${convId}`, { method: "DELETE" })
        removeConversation(convId)
        if (conversationId === convId) {
          clearMessages()
          setConversationId(null)
        }
      } catch {
        // silent
      }
    },
    [conversationId, setConversationId, clearMessages, removeConversation]
  )

  return {
    conversations,
    conversationId,
    switchConversation,
    newConversation,
    deleteConversation,
    loadMessages,
    fetchList,
  }
}

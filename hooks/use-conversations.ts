"use client"

import { useCallback, useEffect, useState } from "react"
import { useChatStore } from "@/stores/chat-store"

export interface ConversationMeta {
  id: string
  title: string
  created_at: string
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConversationMeta[]>([])
  const setConversationId = useChatStore((s) => s.setConversationId)
  const conversationId = useChatStore((s) => s.conversationId)
  const setMessages = useChatStore((s) => s.setMessages)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const fetchList = useCallback(async () => {
    try {
      const resp = await fetch("/api/conversations")
      if (!resp.ok) return
      const data: ConversationMeta[] = await resp.json()
      setConversations(data)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

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

  const newConversation = useCallback(async () => {
    try {
      const resp = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "การสนทนาใหม่" }),
      })
      if (!resp.ok) return
      const conv: ConversationMeta = await resp.json()
      setConversations((prev) => [conv, ...prev])
      setConversationId(conv.id)
      clearMessages()
    } catch {
      // silent
    }
  }, [setConversationId, clearMessages])

  const deleteConversation = useCallback(
    async (convId: string) => {
      try {
        await fetch(`/api/conversations/${convId}`, { method: "DELETE" })
        setConversations((prev) => prev.filter((c) => c.id !== convId))
        if (conversationId === convId) {
          clearMessages()
          setConversationId(null)
        }
      } catch {
        // silent
      }
    },
    [conversationId, setConversationId, clearMessages]
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

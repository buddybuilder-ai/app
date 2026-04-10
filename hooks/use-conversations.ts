"use client"

import { useCallback, useEffect } from "react"
import { useChatStore } from "@/stores/chat-store"
import type { ConversationMeta } from "@/stores/chat-store"

export type { ConversationMeta }

export function useConversations() {
  const conversations = useChatStore((s) => s.conversations)
  const setConversations = useChatStore((s) => s.setConversations)
  const addConversation = useChatStore((s) => s.addConversation)
  const removeConversation = useChatStore((s) => s.removeConversation)
  const setConversationId = useChatStore((s) => s.setConversationId)
  const conversationId = useChatStore((s) => s.conversationId)
  const setMessages = useChatStore((s) => s.setMessages)
  const clearMessages = useChatStore((s) => s.clearMessages)

  const fetchList = useCallback(async () => {
    try {
      const resp = await fetch("/api/conversations")
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
  }, [setConversations])

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

  const newConversation = useCallback(async () => {
    try {
      const resp = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "การสนทนาใหม่" }),
      })
      if (!resp.ok) return
      const conv: ConversationMeta = await resp.json()
      addConversation(conv)
      setConversationId(conv.id)
      clearMessages()
    } catch {
      // silent
    }
  }, [addConversation, setConversationId, clearMessages])

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

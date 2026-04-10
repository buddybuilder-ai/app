"use client"

import { useCallback } from "react"

interface SaveMessageParams {
  projectId: string
  role: "user" | "assistant"
  content: string
  intent?: string
}

/**
 * Saves a single chat message to the backend.
 * Fire-and-forget — errors are silently ignored so they never interrupt the chat UX.
 */
export function useChatPersistence() {
  const saveMessage = useCallback(async (params: SaveMessageParams) => {
    if (!params.projectId || !params.content) return
    try {
      await fetch(`/api/projects/${params.projectId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: params.role,
          content: params.content,
          intent: params.intent ?? null,
        }),
      })
    } catch {
      // silent — persistence is best-effort
    }
  }, [])

  const loadMessages = useCallback(async (projectId: string) => {
    if (!projectId) return []
    try {
      const resp = await fetch(`/api/projects/${projectId}/messages`)
      if (resp.ok) return await resp.json()
    } catch {
      // silent
    }
    return []
  }, [])

  const saveLayout = useCallback(
    async (projectId: string, layout: Record<string, unknown>[]) => {
      if (!projectId) return
      try {
        await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latest_layout: layout }),
        })
      } catch {
        // silent
      }
    },
    []
  )

  return { saveMessage, loadMessages, saveLayout }
}

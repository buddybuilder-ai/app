"use client"

import { useCallback } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { useChatStore } from "@/stores/chat-store"
import type { FurnitureInstance, RoomConfig } from "@/types/editor"

interface ApiProject {
  id: string
  name: string
  room_spec: RoomConfig
  latest_layout: FurnitureInstance[] | null
  conversation_id: string | null
}

export function useProject(projectId: string) {
  const setRoom = useEditorStore((s) => s.setRoom)
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const setConversationId = useChatStore((s) => s.setConversationId)

  const load = useCallback(async () => {
    try {
      const resp = await fetch(`/api/projects/${projectId}`)
      if (!resp.ok) return false

      const data: ApiProject = await resp.json()

      if (data.room_spec) setRoom(data.room_spec)
      if (data.latest_layout?.length) setFurnitureItems(data.latest_layout)
      if (data.conversation_id) setConversationId(data.conversation_id)

      return true
    } catch {
      return false
    }
  }, [projectId, setRoom, setFurnitureItems, setConversationId])

  /** Manual save — PATCHes latest_layout to backend. */
  const save = useCallback(() => {
    fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latest_layout: furnitureItems }),
    }).catch(() => {/* silent */})
    return true
  }, [projectId, furnitureItems])

  return { load, save }
}

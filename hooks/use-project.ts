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
  preview_image: string | null
}

const PREVIEW_MAX_WIDTH = 640

/**
 * Capture the editor's R3F canvas as a compressed PNG data URL.
 * Returns null if no canvas is mounted (e.g. save called before first render).
 * Requires the Canvas to be created with `gl: { preserveDrawingBuffer: true }`.
 */
function capturePreview(): string | null {
  if (typeof document === "undefined") return null
  const canvas = document.querySelector<HTMLCanvasElement>(
    "[data-editor-canvas] canvas, canvas"
  )
  if (!canvas) return null
  try {
    const scale = Math.min(1, PREVIEW_MAX_WIDTH / canvas.width)
    if (scale < 1) {
      const off = document.createElement("canvas")
      off.width = Math.round(canvas.width * scale)
      off.height = Math.round(canvas.height * scale)
      const ctx = off.getContext("2d")
      if (!ctx) return canvas.toDataURL("image/png")
      ctx.drawImage(canvas, 0, 0, off.width, off.height)
      return off.toDataURL("image/jpeg", 0.8)
    }
    return canvas.toDataURL("image/jpeg", 0.8)
  } catch {
    return null
  }
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

  /** Manual save — PATCHes latest_layout (and canvas preview) to backend. */
  const save = useCallback(() => {
    const preview_image = capturePreview()
    const body: Record<string, unknown> = { latest_layout: furnitureItems }
    if (preview_image) body.preview_image = preview_image
    fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {/* silent */})
    return true
  }, [projectId, furnitureItems])

  return { load, save }
}

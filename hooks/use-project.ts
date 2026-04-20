"use client"

import { useCallback } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { useChatStore } from "@/stores/chat-store"
import { FURNITURE_CATALOG } from "@/lib/furniture-catalog"
import type { FurnitureInstance, RoomConfig } from "@/types/editor"

// Rotation that makes the bed's headboard face into the room when placed
// against a given wall. Matches `_WALL_ROTATION` in the backend.
// rotation=0 → model front faces +Z (south).
const BED_WALL_ROTATION: Record<"north" | "south" | "east" | "west", number> = {
  north: 0,
  south: 180,
  west: 270,
  east: 90,
}

const OPPOSITE_WALL: Record<"north" | "south" | "east" | "west", "north" | "south" | "east" | "west"> = {
  south: "north",
  north: "south",
  east: "west",
  west: "east",
}

/**
 * Seed a new/empty project with a single anchor bed placed in the command
 * position (wall opposite the door). The AI layout pipeline cannot work from
 * a truly empty scene — see the empty-room guard in the backend router.
 */
export function buildDefaultBed(room: RoomConfig): FurnitureInstance | null {
  const bed = FURNITURE_CATALOG.find((f) => f.id === "bed-queen")
  if (!bed) return null
  const doorWall = (room.doors?.[0]?.wall ?? "south") as "north" | "south" | "east" | "west"
  const targetWall = OPPOSITE_WALL[doorWall]
  const halfW = room.width / 2
  const halfD = room.depth / 2
  const bedW = bed.dimensions.width
  const bedD = bed.dimensions.depth
  const rotation = BED_WALL_ROTATION[targetWall]
  // For rot 0/180 the bed's depth runs along Z; for 90/270 it runs along X.
  let pos_x = 0
  let pos_z = 0
  if (targetWall === "north") pos_z = -halfD + bedD / 2
  else if (targetWall === "south") pos_z = halfD - bedD / 2
  else if (targetWall === "west") pos_x = -halfW + bedD / 2
  else pos_x = halfW - bedD / 2
  return {
    instanceId: `${bed.id}-seed-${Date.now()}`,
    id: bed.id,
    name: bed.name,
    category: bed.category,
    pos_x,
    pos_y: 0,
    pos_z,
    rotation,
    dimensions: { ...bed.dimensions },
    is_essential: true,
    feng_shui_notes: [],
    model_url: bed.model_url ?? undefined,
  }
}

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
  const name = useEditorStore((s) => s.projectName)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const setConversationId = useChatStore((s) => s.setConversationId)

  const load = useCallback(async () => {
    try {
      const resp = await fetch(`/api/projects/${projectId}`)
      if (!resp.ok) return false

      const data: ApiProject = await resp.json()

      if (data.name) setProjectName(data.name)
      const room = data.room_spec ?? useEditorStore.getState().room
      if (data.room_spec) setRoom(data.room_spec)
      if (data.latest_layout?.length) {
        setFurnitureItems(data.latest_layout, { skipHistory: true })
      } else {
        const seed = buildDefaultBed(room)
        if (seed) {
          setFurnitureItems([seed], { skipHistory: true })
          // Persist the seed so the empty-room guard sees a populated scene
          // on subsequent loads, even if the user never edits anything.
          fetch(`/api/projects/${projectId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latest_layout: [seed] }),
          }).catch(() => {/* best effort */})
        }
      }
      if (data.conversation_id) setConversationId(data.conversation_id)

      return true
    } catch {
      return false
    }
  }, [projectId, setRoom, setFurnitureItems, setConversationId, setProjectName])

  const rename = useCallback(
    async (newName: string) => {
      const trimmed = newName.trim()
      if (!trimmed || trimmed === name) return false
      setProjectName(trimmed)
      try {
        const resp = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        })
        return resp.ok
      } catch {
        return false
      }
    },
    [projectId, name, setProjectName]
  )

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

  return { load, save, name, rename }
}

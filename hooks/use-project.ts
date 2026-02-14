"use client"

import { useCallback } from "react"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance, RoomConfig } from "@/types/editor"

interface ProjectData {
  version: string
  room: RoomConfig
  furnitureItems: FurnitureInstance[]
  savedAt: string
}

const STORAGE_KEY_PREFIX = "buddybuilder-project-"

export function useProject(projectId: string) {
  const room = useEditorStore((s) => s.room)
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const setRoom = useEditorStore((s) => s.setRoom)
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)

  const save = useCallback(() => {
    const data: ProjectData = {
      version: "1.0",
      room,
      furnitureItems,
      savedAt: new Date().toISOString(),
    }

    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${projectId}`,
        JSON.stringify(data)
      )
      return true
    } catch {
      return false
    }
  }, [projectId, room, furnitureItems])

  const load = useCallback(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${projectId}`)
      if (!raw) return false

      const data = JSON.parse(raw) as ProjectData

      if (data.room) setRoom(data.room)
      if (data.furnitureItems) setFurnitureItems(data.furnitureItems)

      return true
    } catch {
      return false
    }
  }, [projectId, setRoom, setFurnitureItems])

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${projectId}`)
      return true
    } catch {
      return false
    }
  }, [projectId])

  return { save, load, remove }
}

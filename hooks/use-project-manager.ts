"use client"

import { useState, useCallback, useEffect } from "react"
import type { RoomConfig } from "@/types/editor"

export interface ProjectMeta {
  id: string
  name: string
  roomType: string
  createdAt: string
  updatedAt: string
}

const INDEX_KEY = "buddybuilder-projects-index"
const PROJECT_PREFIX = "buddybuilder-project-"

export function useProjectManager() {
  const [projects, setProjects] = useState<ProjectMeta[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INDEX_KEY)
      if (raw) setProjects(JSON.parse(raw))
    } catch {
      // ignore parse errors
    }
  }, [])

  const saveIndex = useCallback((list: ProjectMeta[]) => {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list))
    setProjects(list)
  }, [])

  const createProject = useCallback(
    (name: string, roomConfig: RoomConfig): string => {
      const id = `proj-${Date.now()}`
      const now = new Date().toISOString()
      const meta: ProjectMeta = {
        id,
        name,
        roomType: roomConfig.room_type,
        createdAt: now,
        updatedAt: now,
      }
      const data = {
        version: "1.0",
        room: roomConfig,
        furnitureItems: [],
        savedAt: now,
      }
      localStorage.setItem(`${PROJECT_PREFIX}${id}`, JSON.stringify(data))
      const updated = [...projects, meta]
      saveIndex(updated)
      return id
    },
    [projects, saveIndex]
  )

  const deleteProject = useCallback(
    (id: string) => {
      localStorage.removeItem(`${PROJECT_PREFIX}${id}`)
      const updated = projects.filter((p) => p.id !== id)
      saveIndex(updated)
    },
    [projects, saveIndex]
  )

  const renameProject = useCallback(
    (id: string, newName: string) => {
      const updated = projects.map((p) =>
        p.id === id
          ? { ...p, name: newName, updatedAt: new Date().toISOString() }
          : p
      )
      saveIndex(updated)
    },
    [projects, saveIndex]
  )

  return { projects, createProject, deleteProject, renameProject }
}

"use client"

import { useCallback, useEffect, useState } from "react"
import type { RoomConfig } from "@/types/editor"

export interface ProjectMeta {
  id: string
  name: string
  roomType: string
  room_spec: Record<string, unknown>
  latest_layout: Record<string, unknown>[] | null
  preview_image: string | null
  createdAt: string
  updatedAt: string
}

interface ApiProject {
  id: string
  name: string
  room_spec: Record<string, unknown>
  latest_layout: Record<string, unknown>[] | null
  preview_image: string | null
  created_at: string
  updated_at: string
}

function toMeta(p: ApiProject): ProjectMeta {
  return {
    id: p.id,
    name: p.name,
    roomType: (p.room_spec?.room_type as string) ?? "studio_apartment",
    room_spec: p.room_spec,
    latest_layout: p.latest_layout,
    preview_image: p.preview_image ?? null,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }
}

export function useProjectManager() {
  const [projects, setProjects] = useState<ProjectMeta[]>([])

  const fetchProjects = useCallback(async () => {
    try {
      const resp = await fetch("/api/projects")
      if (resp.ok) {
        const data: ApiProject[] = await resp.json()
        setProjects(data.map(toMeta))
      }
    } catch {
      // network error — keep empty list
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/projects")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: ApiProject[]) => {
        if (!cancelled) setProjects(data.map(toMeta))
      })
      .catch(() => {
        /* network error */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const createProject = useCallback(
    async (name: string, roomConfig: RoomConfig): Promise<string> => {
      const resp = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, room_spec: roomConfig }),
      })
      if (!resp.ok) throw new Error("Failed to create project")
      const project: ApiProject = await resp.json()
      setProjects((prev) => [...prev, toMeta(project)])
      return project.id
    },
    []
  )

  const deleteProject = useCallback(async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: "DELETE" })
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const renameProject = useCallback(async (id: string, newName: string) => {
    const resp = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })
    if (resp.ok) {
      const updated: ApiProject = await resp.json()
      setProjects((prev) => prev.map((p) => (p.id === id ? toMeta(updated) : p)))
    }
  }, [])

  const saveLayout = useCallback(
    async (id: string, layout: Record<string, unknown>[]) => {
      await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latest_layout: layout }),
      })
    },
    []
  )

  return { projects, createProject, deleteProject, renameProject, saveLayout, fetchProjects }
}

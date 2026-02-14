"use client"

import { useState, useCallback } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { generateFengShuiLayout } from "@/lib/api-client"
import { parseLayoutToFurniture } from "@/lib/layout-parser"
import type { FengShuiLayoutRequest } from "@/types/layout-api"

export function useLayoutGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)
  const setFengShuiScore = useEditorStore((s) => s.setFengShuiScore)
  const room = useEditorStore((s) => s.room)

  const generate = useCallback(
    async (overrides?: Partial<FengShuiLayoutRequest>) => {
      setIsGenerating(true)
      setError(null)

      try {
        const request: FengShuiLayoutRequest = {
          dimensions: { width: room.width, depth: room.depth },
          room_type: room.room_type,
          doors: room.doors,
          windows: room.windows,
          direction: room.direction,
          budget_level: "medium",
          ...overrides,
        }

        const response = await generateFengShuiLayout(request)

        // Apply furniture to canvas
        const items = parseLayoutToFurniture(response)
        setFurnitureItems(items)

        // Store feng shui score
        setFengShuiScore(response.feng_shui_score)

        return response
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Layout generation failed"
        setError(message)
        throw err
      } finally {
        setIsGenerating(false)
      }
    },
    [room, setFurnitureItems, setFengShuiScore]
  )

  return { generate, isGenerating, error }
}

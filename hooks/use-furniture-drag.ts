"use client"

import { useCallback } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { getFurnitureById } from "@/lib/furniture-catalog"

export function useFurnitureDrag() {
  const addFurniture = useEditorStore((s) => s.addFurniture)
  const room = useEditorStore((s) => s.room)

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const id = e.dataTransfer.getData("application/furniture-id")
      if (!id) return

      const catalogItem = getFurnitureById(id)
      if (!catalogItem) return

      // Calculate approximate drop position relative to room center
      const rect = e.currentTarget.getBoundingClientRect()
      const normalizedX = (e.clientX - rect.left) / rect.width - 0.5
      const normalizedZ = (e.clientY - rect.top) / rect.height - 0.5

      // Map to room coordinates (rough approximation)
      const posX = normalizedX * room.width
      const posZ = normalizedZ * room.depth

      addFurniture({
        id: catalogItem.id,
        instanceId: `${catalogItem.id}-${Date.now()}`,
        name: catalogItem.name,
        category: catalogItem.category,
        pos_x: Math.round(posX * 10) / 10,
        pos_y: 0,
        pos_z: Math.round(posZ * 10) / 10,
        rotation: 0,
        dimensions: { ...catalogItem.dimensions },
        is_essential: catalogItem.is_essential,
        feng_shui_notes: [],
        model_url: catalogItem.model_url ?? undefined,
        model_rotation_offset: 0,
      })
    },
    [addFurniture, room.width, room.depth]
  )

  const handleCanvasDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "copy"
    },
    []
  )

  return { handleCanvasDrop, handleCanvasDragOver }
}

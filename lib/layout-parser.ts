import type { FengShuiLayoutResponse } from "@/types/layout-api"
import type { FurnitureInstance } from "@/types/editor"

/**
 * Converts API layout response items into FurnitureInstance[]
 * that can be loaded directly into the editor store.
 */
export function parseLayoutToFurniture(
  response: FengShuiLayoutResponse
): FurnitureInstance[] {
  return response.items.map((item, i) => ({
    ...item,
    instanceId: `${item.id}-${Date.now()}-${i}`,
  }))
}

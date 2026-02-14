import type { z } from "zod"
import type { RoomConfigSchema, ZoneDefinitionSchema } from "./schemas/room"
import type { PlacedFurnitureItemSchema } from "./schemas/furniture"
import type { FengShuiScoreBreakdownSchema } from "./schemas/feng-shui"

export type RoomConfig = z.infer<typeof RoomConfigSchema>
export type ZoneDefinition = z.infer<typeof ZoneDefinitionSchema>
export type PlacedFurnitureItem = z.infer<typeof PlacedFurnitureItemSchema>
export type FengShuiScoreBreakdown = z.infer<typeof FengShuiScoreBreakdownSchema>

export type ActiveTool = "select" | "move" | "rotate" | "delete"
export type ViewMode = "2d" | "3d"

export interface FurnitureInstance extends PlacedFurnitureItem {
  instanceId: string
}

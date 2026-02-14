import type { RoomConfig, FurnitureInstance } from "./editor"

export interface Project {
  id: string
  name: string
  description?: string
  roomConfig: RoomConfig
  furnitureItems: FurnitureInstance[]
  createdAt: Date
  updatedAt: Date
  thumbnail?: string
}

import type { z } from "zod"
import type {
  FurnitureCatalogItemSchema,
  FurnitureDimensionsSchema,
} from "./schemas/furniture"
import type { FurnitureCategorySchema } from "./schemas/common"

export type FurnitureDimensions = z.infer<typeof FurnitureDimensionsSchema>
export type FurnitureCatalogItem = z.infer<typeof FurnitureCatalogItemSchema>
export type FurnitureCategory = z.infer<typeof FurnitureCategorySchema>

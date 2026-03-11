import { z } from "zod"
import { FurnitureCategorySchema, FiveElementSchema } from "./common"

export const FurnitureDimensionsSchema = z.object({
  width: z.number().positive(),
  depth: z.number().positive(),
  height: z.number().positive(),
})

export const FurnitureCatalogItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: FurnitureCategorySchema,
  dimensions: FurnitureDimensionsSchema,
  min_clearance: z.number().nonnegative().default(0.6),
  element: FiveElementSchema.default("wood"),
  is_essential: z.boolean().default(false),
  model_url: z.string().nullable().optional(),
  // Correction offset (degrees) baked into the .glb file.
  // Added to AI rotation before rendering. Default 0 = no correction needed.
  model_rotation_offset: z.number().int().default(0).optional(),
})

export const PlacedFurnitureItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  pos_x: z.number(),
  pos_y: z.number().default(0),
  pos_z: z.number(),
  rotation: z.number().min(0).max(359).default(0),
  dimensions: FurnitureDimensionsSchema,
  is_essential: z.boolean().default(true),
  feng_shui_notes: z.array(z.string()).default([]),
  // Correction offset (degrees) for 3D models whose "forward" direction
  // doesn't match the system convention (rotation=0 → front faces +Z).
  // Added to rotation before rendering. Default 0 = no correction needed.
  model_rotation_offset: z.number().int().default(0).optional(),
})

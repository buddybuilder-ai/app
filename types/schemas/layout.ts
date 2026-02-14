import { z } from "zod"
import { RoomTypeSchema, BudgetLevelSchema } from "./common"
import { RoomDimensionsSchema, DoorPositionSchema, WindowPositionSchema } from "./room"
import { PlacedFurnitureItemSchema } from "./furniture"
import {
  FengShuiScoreBreakdownSchema,
  FengShuiAnalysisSchema,
} from "./feng-shui"

// --- Requests ---

export const DesignRequestSchema = z.object({
  dimensions: RoomDimensionsSchema,
  style: z.string().min(1),
  requirements: z.string(),
})

export const FengShuiLayoutRequestSchema = z.object({
  dimensions: RoomDimensionsSchema,
  room_type: RoomTypeSchema,
  doors: z.array(DoorPositionSchema).default([]),
  windows: z.array(WindowPositionSchema).default([]),
  style: z.string().nullable().optional(),
  user_preferences: z.record(z.string(), z.unknown()).nullable().optional(),
  budget_level: BudgetLevelSchema.default("medium"),
  direction: z.string().default("north"),
})

// --- Responses ---

export const LayoutConstraintSchema = z.object({
  constraint_type: z.string(),
  description: z.string(),
  satisfied: z.boolean(),
  severity: z.enum(["error", "warning", "info"]).default("warning"),
})

export const LayoutMetadataSchema = z.object({
  layout_id: z.string(),
  generated_at: z.string(),
  version: z.string().default("1.0"),
  generation_time_ms: z.number().int().nonnegative().default(0),
  retries: z.number().int().nonnegative().default(0),
  agent_model: z.string().nullable().optional(),
})

export const FengShuiLayoutResponseSchema = z.object({
  items: z.array(PlacedFurnitureItemSchema).default([]),
  feng_shui_score: FengShuiScoreBreakdownSchema,
  feng_shui_analysis: FengShuiAnalysisSchema.nullable().optional(),
  constraints: z.array(LayoutConstraintSchema).default([]),
  reasoning: z.string(),
  warnings: z.array(z.string()).default([]),
  skipped_items: z.array(z.string()).default([]),
  metadata: LayoutMetadataSchema,
})

export const DesignResponseSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        pos_x: z.number(),
        pos_y: z.number(),
        pos_z: z.number(),
        rotation: z.number(),
      })
    )
    .default([]),
  reasoning: z.string(),
})

import { z } from "zod"
import { WallSideSchema, RoomTypeSchema } from "./common"

export const RoomDimensionsSchema = z.object({
  width: z.number().positive(),
  depth: z.number().positive(),
})

export const DoorPositionSchema = z.object({
  wall: WallSideSchema,
  offset: z.number().nonnegative(),
  width: z.number().positive().default(0.9),
  swing_inward: z.boolean().default(true),
})

export const WindowPositionSchema = z.object({
  wall: WallSideSchema,
  offset: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive().default(1.2),
  sill_height: z.number().nonnegative().default(0.9),
})

export const RoomConfigSchema = z.object({
  width: z.number().positive(),
  depth: z.number().positive(),
  height: z.number().positive().default(2.8),
  room_type: RoomTypeSchema.default("bedroom"),
  doors: z.array(DoorPositionSchema).default([]),
  windows: z.array(WindowPositionSchema).default([]),
  direction: WallSideSchema.default("north"),
})

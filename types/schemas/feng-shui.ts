import { z } from "zod"
import { RulePrioritySchema } from "./common"

export const FengShuiScoreBreakdownSchema = z.object({
  command_position: z.number().int().min(0).max(30),
  five_elements_balance: z.number().int().min(0).max(20),
  chi_flow: z.number().int().min(0).max(25),
  sha_chi_avoidance: z.number().int().min(0).max(25),
})

export const ElementBalanceSchema = z.object({
  wood: z.number().int().nonnegative().default(0),
  fire: z.number().int().nonnegative().default(0),
  earth: z.number().int().nonnegative().default(0),
  metal: z.number().int().nonnegative().default(0),
  water: z.number().int().nonnegative().default(0),
})

export const CommandPositionSchema = z.object({
  furniture_id: z.string(),
  is_in_position: z.boolean().default(false),
  can_see_door: z.boolean().default(false),
  has_wall_backing: z.boolean().default(false),
  distance_from_ideal: z.number().nonnegative().default(0),
})

export const ShaChiLineSchema = z.object({
  from_element: z.string(),
  to_element: z.string(),
  intensity: z.number().int().min(1).max(10).default(5),
  mitigation: z.string().nullable().optional(),
})

export const FengShuiRecommendationSchema = z.object({
  category: z.string(),
  description: z.string(),
  priority: RulePrioritySchema.default(3),
  expected_improvement: z.number().int().nonnegative().default(0),
})

export const FengShuiAnalysisSchema = z.object({
  score: FengShuiScoreBreakdownSchema,
  command_positions: z.array(CommandPositionSchema).default([]),
  element_balance: ElementBalanceSchema.default({
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  }),
  sha_chi_lines: z.array(ShaChiLineSchema).default([]),
  recommendations: z.array(FengShuiRecommendationSchema).default([]),
  warnings: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
})

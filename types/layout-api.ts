import type { z } from "zod"
import type {
  DesignRequestSchema,
  DesignResponseSchema,
  FengShuiLayoutRequestSchema,
  FengShuiLayoutResponseSchema,
  LayoutConstraintSchema,
  LayoutMetadataSchema,
} from "./schemas/layout"

export type DesignRequest = z.infer<typeof DesignRequestSchema>
export type DesignResponse = z.infer<typeof DesignResponseSchema>
export type FengShuiLayoutRequest = z.infer<typeof FengShuiLayoutRequestSchema>
export type FengShuiLayoutResponse = z.infer<
  typeof FengShuiLayoutResponseSchema
>
export type LayoutConstraint = z.infer<typeof LayoutConstraintSchema>
export type LayoutMetadata = z.infer<typeof LayoutMetadataSchema>

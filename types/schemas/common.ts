import { z } from "zod"

export const ChatModeSchema = z.enum(["mentor", "buddy", "fun"])

export const RoomTypeSchema = z.enum([
  "bedroom",
  "living_room",
  "office",
  "dining_room",
  "kitchen",
  "bathroom",
  "studio_apartment",
])

export const WallSideSchema = z.enum(["north", "south", "east", "west"])

export const FiveElementSchema = z.enum([
  "wood",
  "fire",
  "earth",
  "metal",
  "water",
])

export const RulePrioritySchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
])

export const FurnitureCategorySchema = z.enum([
  "bed",
  "wardrobe",
  "nightstand",
  "dresser",
  "sofa",
  "armchair",
  "coffee_table",
  "tv_stand",
  "bookshelf",
  "desk",
  "chair",
  "filing_cabinet",
  "dining_table",
  "dining_chair",
  "sideboard",
  "plant",
  "lamp",
  "rug",
  "sofa_bed",
  "room_divider",
  "compact_wardrobe",
  "kitchen_counter",
  "mini_fridge",
  "shoe_cabinet",
  "coat_rack",
  "microwave_stand",
  "folding_desk",
  "compact_dining",
])

export const PlacementStatusSchema = z.enum([
  "success",
  "partial",
  "failed",
  "skipped",
])

export const FengShuiDirectionSchema = z.enum([
  "north",
  "south",
  "east",
  "west",
  "northeast",
  "northwest",
  "southeast",
  "southwest",
  "center",
])

export const ZoneQualitySchema = z.enum([
  "excellent",
  "good",
  "acceptable",
  "poor",
  "avoid",
])

export const BudgetLevelSchema = z.enum(["low", "medium", "high"])

export const StudioZoneSchema = z.enum([
  "sleep",
  "living",
  "work",
  "dining",
  "kitchen",
  "storage",
  "entrance",
])

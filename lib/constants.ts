export const APP_NAME = "BuddyBuilder AI"
export const APP_DESCRIPTION =
  "AI-Powered 3D Interior Design Platform with Feng Shui Analysis"

export const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000"

export const CHAT_MODES = {
  mentor: { label: "Mentor", description: "Formal, educational guidance" },
  buddy: { label: "Buddy", description: "Friendly, encouraging companion" },
  fun: { label: "Fun", description: "Playful, entertaining interaction" },
} as const

export const ROOM_TYPES = {
  studio_apartment: { label: "Studio Apartment", labelTh: "ห้องสตูดิโอ" },
  bedroom: { label: "Bedroom", labelTh: "ห้องนอน" },
  living_room: { label: "Living Room", labelTh: "ห้องนั่งเล่น" },
  office: { label: "Office", labelTh: "ห้องทำงาน" },
  dining_room: { label: "Dining Room", labelTh: "ห้องอาหาร" },
  kitchen: { label: "Kitchen", labelTh: "ห้องครัว" },
  bathroom: { label: "Bathroom", labelTh: "ห้องน้ำ" },
} as const

export const WALL_SIDES = {
  north: { label: "North", labelTh: "เหนือ" },
  south: { label: "South", labelTh: "ใต้" },
  east: { label: "East", labelTh: "ตะวันออก" },
  west: { label: "West", labelTh: "ตะวันตก" },
} as const

export const STUDIO_ZONES = {
  sleep: { label: "Sleep Zone", labelTh: "โซนนอน", color: "#6366f1" },
  living: { label: "Living Zone", labelTh: "โซนนั่งเล่น", color: "#06b6d4" },
  work: { label: "Work Zone", labelTh: "โซนทำงาน", color: "#f59e0b" },
  dining: { label: "Dining Zone", labelTh: "โซนทานอาหาร", color: "#10b981" },
  kitchen: { label: "Kitchen Zone", labelTh: "โซนครัว", color: "#ef4444" },
  storage: { label: "Storage Zone", labelTh: "โซนเก็บของ", color: "#8b5cf6" },
  entrance: { label: "Entrance Zone", labelTh: "โซนทางเข้า", color: "#f97316" },
} as const

export const STUDIO_PRESETS = {
  small: {
    label: "Small Studio (24 sqm)",
    labelTh: "สตูดิโอเล็ก (24 ตร.ม.)",
    width: 6,
    depth: 4,
    doors: [
      { wall: "south" as const, offset: 1.0, width: 0.9, swing_inward: true },
    ],
    windows: [
      {
        wall: "north" as const,
        offset: 2.0,
        width: 1.5,
        height: 1.2,
        sill_height: 0.9,
      },
    ],
  },
  medium: {
    label: "Medium Studio (28 sqm)",
    labelTh: "สตูดิโอกลาง (28 ตร.ม.)",
    width: 7,
    depth: 4,
    doors: [
      { wall: "south" as const, offset: 1.0, width: 0.9, swing_inward: true },
    ],
    windows: [
      {
        wall: "north" as const,
        offset: 2.5,
        width: 1.5,
        height: 1.2,
        sill_height: 0.9,
      },
      {
        wall: "east" as const,
        offset: 1.5,
        width: 1.0,
        height: 1.2,
        sill_height: 0.9,
      },
    ],
  },
  large: {
    label: "Large Studio (35 sqm)",
    labelTh: "สตูดิโอใหญ่ (35 ตร.ม.)",
    width: 7,
    depth: 5,
    doors: [
      { wall: "south" as const, offset: 1.0, width: 0.9, swing_inward: true },
    ],
    windows: [
      {
        wall: "north" as const,
        offset: 2.5,
        width: 2.0,
        height: 1.2,
        sill_height: 0.9,
      },
      {
        wall: "east" as const,
        offset: 2.0,
        width: 1.0,
        height: 1.2,
        sill_height: 0.9,
      },
    ],
  },
} as const

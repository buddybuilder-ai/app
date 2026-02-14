export const APP_NAME = "BuddyBuilder AI"
export const APP_DESCRIPTION =
  "AI-Powered 3D Interior Design Platform with Feng Shui Analysis"

export const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"

export const CHAT_MODES = {
  mentor: { label: "Mentor", description: "Formal, educational guidance" },
  buddy: { label: "Buddy", description: "Friendly, encouraging companion" },
  fun: { label: "Fun", description: "Playful, entertaining interaction" },
} as const

export const ROOM_TYPES = {
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

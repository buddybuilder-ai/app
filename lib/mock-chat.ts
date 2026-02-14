import type { PlacedFurnitureItem } from "@/types/editor"
import type { ChatMode } from "@/types/chat"

interface MockResponse {
  answer: string
  items: PlacedFurnitureItem[]
  fengShuiScore: {
    command_position: number
    five_elements_balance: number
    chi_flow: number
    sha_chi_avoidance: number
  }
}

// Studio apartment layout - optimized for 6x4m room
const STUDIO_MOCK_LAYOUT: PlacedFurnitureItem[] = [
  // Sleeping Zone (far left corner)
  {
    id: "sofa-bed",
    name: "Sofa Bed",
    category: "sofa_bed",
    pos_x: -2.0,
    pos_y: 0,
    pos_z: -1.2,
    rotation: 0,
    dimensions: { width: 1.8, depth: 0.9, height: 0.85 },
    is_essential: true,
    feng_shui_notes: [
      "เตียงวางชิดผนังด้านหลัง มีที่พิงหลัง (Command Position)",
      "หัวเตียงไม่ตรงกับประตู หลีกเลี่ยง Sha Chi",
      "ใช้ room divider แยกโซนนอนจากโซนอื่น",
    ],
  },
  {
    id: "nightstand",
    name: "Nightstand",
    category: "nightstand",
    pos_x: -0.8,
    pos_y: 0,
    pos_z: -1.5,
    rotation: 0,
    dimensions: { width: 0.5, depth: 0.4, height: 0.55 },
    is_essential: false,
    feng_shui_notes: ["โต๊ะข้างเตียงสำหรับวางของจำเป็น"],
  },
  // Room Divider (separates sleeping from living)
  {
    id: "room-divider",
    name: "Room Divider",
    category: "room_divider",
    pos_x: -0.5,
    pos_y: 0,
    pos_z: 0,
    rotation: 90,
    dimensions: { width: 1.5, depth: 0.1, height: 1.6 },
    is_essential: false,
    feng_shui_notes: ["แยกโซนนอนจากโซนนั่งเล่น ช่วยรักษาพลังงาน"],
  },
  // Living Zone (center-right)
  {
    id: "coffee-table",
    name: "Coffee Table",
    category: "coffee_table",
    pos_x: 0.8,
    pos_y: 0,
    pos_z: 0,
    rotation: 0,
    dimensions: { width: 1.2, depth: 0.6, height: 0.45 },
    is_essential: false,
    feng_shui_notes: ["โต๊ะกลางสำหรับโซนนั่งเล่น"],
  },
  {
    id: "tv-stand",
    name: "TV Stand",
    category: "tv_stand",
    pos_x: 2.3,
    pos_y: 0,
    pos_z: 0,
    rotation: 270,
    dimensions: { width: 1.5, depth: 0.4, height: 0.5 },
    is_essential: false,
    feng_shui_notes: ["วางทีวีชิดผนังด้านข้าง"],
  },
  // Work Zone (near window)
  {
    id: "folding-desk",
    name: "Folding Desk",
    category: "folding_desk",
    pos_x: 1.5,
    pos_y: 0,
    pos_z: -1.5,
    rotation: 0,
    dimensions: { width: 0.9, depth: 0.5, height: 0.75 },
    is_essential: false,
    feng_shui_notes: [
      "โต๊ะทำงานหันหน้าเข้าห้อง สามารถมองเห็นประตูได้",
      "ใช้โต๊ะพับได้เพื่อประหยัดพื้นที่",
    ],
  },
  {
    id: "office-chair",
    name: "Office Chair",
    category: "chair",
    pos_x: 1.5,
    pos_y: 0,
    pos_z: -0.8,
    rotation: 0,
    dimensions: { width: 0.6, depth: 0.6, height: 1.1 },
    is_essential: true,
    feng_shui_notes: [],
  },
  // Kitchen Zone (near entrance)
  {
    id: "kitchen-counter",
    name: "Kitchen Counter",
    category: "kitchen_counter",
    pos_x: -2.0,
    pos_y: 0,
    pos_z: 1.3,
    rotation: 0,
    dimensions: { width: 1.5, depth: 0.6, height: 0.9 },
    is_essential: true,
    feng_shui_notes: ["วางครัวชิดผนัง ห่างจากโซนนอน"],
  },
  {
    id: "mini-fridge",
    name: "Mini Fridge",
    category: "mini_fridge",
    pos_x: -0.8,
    pos_y: 0,
    pos_z: 1.5,
    rotation: 0,
    dimensions: { width: 0.5, depth: 0.55, height: 0.85 },
    is_essential: true,
    feng_shui_notes: ["ตู้เย็นวางใกล้ครัว"],
  },
  // Storage Zone
  {
    id: "compact-wardrobe",
    name: "Compact Wardrobe",
    category: "compact_wardrobe",
    pos_x: 2.3,
    pos_y: 0,
    pos_z: -1.5,
    rotation: 270,
    dimensions: { width: 1.0, depth: 0.55, height: 2.0 },
    is_essential: true,
    feng_shui_notes: ["ตู้เสื้อผ้าวางชิดผนังด้านข้าง ไม่บังทางเดิน"],
  },
  // Decorations
  {
    id: "plant-medium",
    name: "Indoor Plant",
    category: "plant",
    pos_x: -2.5,
    pos_y: 0,
    pos_z: -1.8,
    rotation: 0,
    dimensions: { width: 0.4, depth: 0.4, height: 1.0 },
    is_essential: false,
    feng_shui_notes: [
      "ต้นไม้ธาตุไม้ช่วยเสริมพลังชีวิต (Wood Element)",
    ],
  },
  {
    id: "floor-lamp",
    name: "Floor Lamp",
    category: "lamp",
    pos_x: -0.3,
    pos_y: 0,
    pos_z: -1.8,
    rotation: 0,
    dimensions: { width: 0.3, depth: 0.3, height: 1.5 },
    is_essential: false,
    feng_shui_notes: ["โคมไฟช่วยเพิ่มแสงสว่างในมุมมืด เสริม Chi Flow"],
  },
  {
    id: "area-rug",
    name: "Area Rug",
    category: "rug",
    pos_x: 0.5,
    pos_y: 0,
    pos_z: 0,
    rotation: 0,
    dimensions: { width: 2.0, depth: 1.5, height: 0.02 },
    is_essential: false,
    feng_shui_notes: ["พรมช่วยกำหนดโซนนั่งเล่น"],
  },
]

const STUDIO_MOCK_SCORE = {
  command_position: 24,
  five_elements_balance: 18,
  chi_flow: 22,
  sha_chi_avoidance: 23,
}

const STUDIO_MODE_ANSWERS: Record<ChatMode, string> = {
  mentor: `🏯 **การวิเคราะห์ผังห้อง Studio Apartment สไตล์ Japanese Zen**

ได้ออกแบบผังห้องสตูดิโอขนาด 6x4 เมตรโดยแบ่งเป็น 5 โซนหลัก:

**โซนนอน (Sleeping Zone)**
- Sofa Bed วางชิดผนังด้านในสุด มีที่พิงหลังมั่นคง
- ใช้ Room Divider แยกจากโซนอื่น เพื่อความเป็นส่วนตัว
- หัวเตียงไม่ตรงกับประตู หลีกเลี่ยง Sha Chi

**โซนนั่งเล่น (Living Zone)**
- พื้นที่ตรงกลางห้อง ใช้พรมกำหนดขอบเขต
- TV Stand วางชิดผนังด้านข้าง

**โซนทำงาน (Work Zone)**
- Folding Desk หันหน้าเข้าห้อง มองเห็นประตูได้
- ใช้โต๊ะพับได้เพื่อประหยัดพื้นที่

**โซนครัว (Kitchen Zone)**
- วางชิดผนังด้านใกล้ประตู
- ห่างจากโซนนอนเพื่อความสะอาด

**โซนเก็บของ (Storage Zone)**
- Compact Wardrobe วางชิดผนังไม่บังทางเดิน

**คะแนนฮวงจุ้ย:**
- Command Position: 24/30
- Five Elements Balance: 18/20
- Chi Flow: 22/25
- Sha Chi Avoidance: 23/25

**คะแนนรวม: 87/100** — ดีเยี่ยม ✨

กดปุ่ม "นำไปใช้" เพื่อวางเฟอร์นิเจอร์ลงใน Canvas`,

  buddy: `สวัสดีจ้า! 🏠 จัด Studio Apartment ให้แล้วนะ!

ห้องสตูดิโอ 6x4 เมตร แบ่งเป็น 5 โซน:

**🛏️ โซนนอน**
• Sofa Bed ประหยัดพื้นที่
• Room Divider แยกโซน
• หัวเตียงไม่ตรงประตู ฮวงจุ้ยดี!

**🛋️ โซนนั่งเล่น**
• พรมกำหนดพื้นที่
• TV ชิดผนัง

**💼 โซนทำงาน**
• Folding Desk ประหยัดที่
• หันหน้าเข้าห้อง Power Position!

**🍳 โซนครัว**
• Kitchen Counter ชิดผนัง
• Mini Fridge ใกล้ครัว

**🗄️ โซนเก็บของ**
• Compact Wardrobe ไม่บังทาง

คะแนนฮวงจุ้ย: **87/100** เยี่ยมมาก!

กด "นำไปใช้" แล้วดูใน 3D ได้เลยจ้า 🙌`,

  fun: `โย่! จัด Studio Room แบบ Pro มาให้แล้ว! 🎮✨

ห้องเดียวครบจบ 5 โซน!

**🛏️ Sleep Zone**
Sofa Bed นอนดี ไม่ตรงประตู ผีไม่มาหา 😂
Room Divider กั้นเป็นส่วนตัว ไม่โชว์หน้าตาแขก!

**🎮 Chill Zone**
พรมสวยๆ กำหนดโซน
TV ชิดผนัง ดูซีรีส์สบาย

**💼 Work Zone**
Folding Desk ใช้แล้วพับเก็บได้ เท่ห์มาก!
หันหน้าเข้าห้อง เหมือน Boss

**🍳 Kitchen Zone**
ครัวชิดผนัง ทำมากินได้
Mini Fridge เก็บขนมไว้กินยามค่ำคืน

**🗄️ Storage Zone**
ตู้เสื้อผ้ากะทัดรัด เก็บของได้เยอะ

ฮวงจุ้ย **87 คะแนน** — S-Rank แล้วจ้า! 🏆

กดปุ่มข้างล่างเอาไปใส่ Canvas เลยยย~ 🔥`,
}

export async function getMockChatResponse(
  text: string,
  mode: ChatMode
): Promise<MockResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  return {
    answer: STUDIO_MODE_ANSWERS[mode],
    items: STUDIO_MOCK_LAYOUT,
    fengShuiScore: STUDIO_MOCK_SCORE,
  }
}

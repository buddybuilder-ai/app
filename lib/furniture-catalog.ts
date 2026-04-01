import type { FurnitureCatalogItem } from "@/types/furniture"

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // QueenBedroom
  {
    id: "bed-queen",
    name: "Queen Bed",
    category: "bed",
    dimensions: { width: 1.6, depth: 2.0, height: 0.5 },
    min_clearance: 0.6,
    element: "wood",
    is_essential: true,
    model_url: "/furniture_models/queen_bed.glb",
  },
  {
    id: "wardrobe-large",
    name: "Large Wardrobe",
    category: "wardrobe",
    dimensions: { width: 1.8, depth: 0.6, height: 2.0 },
    min_clearance: 0.8,
    element: "wood",
    is_essential: true,
    model_url: "/furniture_models/large_wardrobe.glb",
    
  },
  {
    id: "nightstand",
    name: "Nightstand",
    category: "nightstand",
    dimensions: { width: 0.5, depth: 0.4, height: 0.55 },
    min_clearance: 0.3,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/nightstand.glb",
  },
  {
    id: "dresser",
    name: "Dresser",
    category: "dresser",
    dimensions: { width: 1.2, depth: 0.5, height: 0.8 },
    min_clearance: 0.6,
    element: "wood",
    is_essential: false,
  },
  // Living Room
  {
    id: "sofa-3seat",
    name: "3-Seat Sofa",
    category: "sofa",
    dimensions: { width: 2.2, depth: 0.9, height: 0.85 },
    min_clearance: 0.6,
    element: "earth",
    is_essential: true,
    model_url: "/furniture_models/3_seat_sofa.glb",
  },
  {
    id: "armchair",
    name: "Armchair",
    category: "armchair",
    dimensions: { width: 0.8, depth: 0.8, height: 0.85 },
    min_clearance: 0.5,
    element: "earth",
    is_essential: false,
  },
  {
    id: "coffee-table",
    name: "Coffee Table",
    category: "coffee_table",
    dimensions: { width: 1.2, depth: 0.6, height: 0.45 },
    min_clearance: 0.4,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/coffee_table.glb",
  },
  {
    id: "tv-stand",
    name: "TV Stand",
    category: "tv_stand",
    dimensions: { width: 1.5, depth: 0.4, height: 0.5 },
    min_clearance: 0.6,
    element: "metal",
    is_essential: false,
    model_url: "/furniture_models/tv_stand.glb",
  },
  {
    id: "bookshelf",
    name: "Bookshelf",
    category: "bookshelf",
    dimensions: { width: 0.8, depth: 0.3, height: 1.8 },
    min_clearance: 0.5,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/bookshelf.glb",
  },
  // Office
  {
    id: "desk-work",
    name: "Work Desk",
    category: "desk",
    dimensions: { width: 1.4, depth: 0.7, height: 0.75 },
    min_clearance: 0.8,
    element: "wood",
    is_essential: true,
    model_url: "/furniture_models/work_desk.glb",
  },
  {
    id: "office-chair",
    name: "Office Chair",
    category: "chair",
    dimensions: { width: 0.6, depth: 0.6, height: 1.1 },
    min_clearance: 0.6,
    element: "metal",
    is_essential: true,
    model_url: "/furniture_models/office_chair_v2.glb",
    model_rotation_offset: 180,
  },
  // Dining
  {
    id: "dining-table",
    name: "Dining Table",
    category: "dining_table",
    dimensions: { width: 1.6, depth: 0.9, height: 0.75 },
    min_clearance: 0.8,
    element: "wood",
    is_essential: true,
    model_url: "/furniture_models/dining_table.glb",
  },
  {
    id: "dining-chair",
    name: "Dining Chair",
    category: "dining_chair",
    dimensions: { width: 0.45, depth: 0.45, height: 0.9 },
    min_clearance: 0.5,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/dining_chair.glb",
  },
  // General
  {
    id: "plant-medium",
    name: "Indoor Plant",
    category: "plant",
    dimensions: { width: 0.4, depth: 0.4, height: 1.0 },
    min_clearance: 0.2,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/indoor_plant.glb",
  },
  {
    id: "floor-lamp",
    name: "Floor Lamp",
    category: "lamp",
    dimensions: { width: 0.3, depth: 0.3, height: 1.5 },
    min_clearance: 0.2,
    element: "fire",
    is_essential: false,
    model_url: "/furniture_models/floor_lamp.glb",
  },
  {
    id: "area-rug",
    name: "Area Rug",
    category: "rug",
    dimensions: { width: 2.0, depth: 1.5, height: 0.02 },
    min_clearance: 0,
    element: "earth",
    is_essential: false,
    model_url: "/furniture_models/area_rug.glb",
  },
  // Studio Apartment
  {
    id: "sofa-bed",
    name: "Sofa Bed",
    category: "sofa_bed",
    dimensions: { width: 1.8, depth: 0.9, height: 0.85 },
    min_clearance: 0.6,
    element: "earth",
    is_essential: true,
    model_url: "/furniture_models/sofa_bed.glb",
  },
  {
    id: "compact-wardrobe",
    name: "Compact Wardrobe",
    category: "compact_wardrobe",
    dimensions: { width: 1.0, depth: 0.55, height: 2.0 },
    min_clearance: 0.7,
    element: "wood",
    is_essential: true,
    model_url: "/furniture_models/compact_wardrobe.glb",
  },
  {
    id: "room-divider",
    name: "Room Divider",
    category: "room_divider",
    dimensions: { width: 1.5, depth: 0.1, height: 1.6 },
    min_clearance: 0.3,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/room_divider.glb",
  },
  {
    id: "folding-desk",
    name: "Folding Desk",
    category: "folding_desk",
    dimensions: { width: 0.9, depth: 0.5, height: 0.75 },
    min_clearance: 0.7,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/folding_desk.glb",
  },
  {
    id: "compact-dining-set",
    name: "Compact Dining Set",
    category: "compact_dining",
    dimensions: { width: 0.8, depth: 0.8, height: 0.75 },
    min_clearance: 0.6,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/compact_dining_set.glb",
  },
  {
    id: "kitchen-counter",
    name: "Kitchen Counter",
    category: "kitchen_counter",
    dimensions: { width: 1.5, depth: 0.6, height: 0.9 },
    min_clearance: 0.8,
    element: "metal",
    is_essential: true,
    model_url: "/furniture_models/kitchen_counter.glb",
  },
  {
    id: "mini-fridge",
    name: "Mini Fridge",
    category: "mini_fridge",
    dimensions: { width: 0.5, depth: 0.55, height: 0.85 },
    min_clearance: 0.5,
    element: "metal",
    is_essential: true,
    model_url: "/furniture_models/mini_fridge.glb",
  },
  {
    id: "microwave-stand",
    name: "Microwave Stand",
    category: "microwave_stand",
    dimensions: { width: 0.6, depth: 0.4, height: 0.8 },
    min_clearance: 0.4,
    element: "metal",
    is_essential: false,
    model_url: "/furniture_models/microwave_stand.glb",
  },
  {
    id: "shoe-cabinet",
    name: "Shoe Cabinet",
    category: "shoe_cabinet",
    dimensions: { width: 0.8, depth: 0.35, height: 1.0 },
    min_clearance: 0.5,
    element: "wood",
    is_essential: false,
    model_url: "/furniture_models/shoe_cabinet.glb",
  },
  {
    id: "coat-rack",
    name: "Coat Rack",
    category: "coat_rack",
    dimensions: { width: 0.4, depth: 0.4, height: 1.7 },
    min_clearance: 0.3,
    element: "metal",
    is_essential: false,
    model_url: "/furniture_models/coat_rack.glb",
  },
]

export function getFurnitureByCategory(category: string) {
  return FURNITURE_CATALOG.filter((item) => item.category === category)
}

export function getFurnitureById(id: string) {
  return FURNITURE_CATALOG.find((item) => item.id === id)
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  Bedroom: ["bed", "wardrobe", "nightstand", "dresser"],
  "Living Room": ["sofa", "armchair", "coffee_table", "tv_stand", "bookshelf"],
  Office: ["desk", "chair", "filing_cabinet"],
  "Dining Room": ["dining_table", "dining_chair", "sideboard"],
  General: ["plant", "lamp", "rug"],
}

const STUDIO_CATEGORY_GROUPS: Record<string, string[]> = {
  "โซนนอน": ["bed", "sofa_bed", "nightstand"],
  "โซนนั่งเล่น": ["sofa", "coffee_table", "tv_stand", "room_divider"],
  "โซนทำงาน": ["desk", "folding_desk", "chair"],
  "โซนทานอาหาร": ["compact_dining", "dining_table", "dining_chair"],
  "โซนครัว": ["kitchen_counter", "mini_fridge", "microwave_stand"],
  "เก็บของ": ["compact_wardrobe", "wardrobe", "bookshelf", "shoe_cabinet", "coat_rack"],
  "เครื่องตกแต่ง": ["plant", "lamp", "rug"],
}

export function getCategorizedFurniture(roomType?: string) {
  const groups =
    roomType === "studio_apartment" ? STUDIO_CATEGORY_GROUPS : CATEGORY_GROUPS
  return Object.entries(groups).map(([group, categories]) => ({
    group,
    items: FURNITURE_CATALOG.filter((item) =>
      categories.includes(item.category)
    ),
  }))
}

// Zone recommendations for studio apartment
export const STUDIO_ZONE_RECOMMENDATIONS = {
  sleeping: {
    name: "โซนนอน (Sleeping Zone)",
    description: "พื้นที่สำหรับพักผ่อน ควรอยู่ด้านในสุดของห้อง",
    essentialFurniture: ["bed-queen", "sofa-bed", "nightstand"],
    optionalFurniture: ["dresser", "compact-wardrobe"],
    fengShuiTips: [
      "หัวเตียงควรชนผนังและไม่ตรงกับประตู",
      "หลีกเลี่ยงการวางเตียงใต้คานหรือเพดานลาด",
      "ใช้ room divider แยกโซนนอนจากโซนอื่น",
    ],
  },
  living: {
    name: "โซนนั่งเล่น (Living Zone)",
    description: "พื้นที่สำหรับพักผ่อนและรับแขก",
    essentialFurniture: ["sofa-3seat", "coffee-table", "tv-stand"],
    optionalFurniture: ["armchair", "floor-lamp", "area-rug"],
    fengShuiTips: [
      "วางโซฟาให้เห็นประตูทางเข้า",
      "ใช้พื้นที่ใต้โซฟาเก็บของ",
      "เลือกโซฟาขนาดเหมาะสมกับพื้นที่",
    ],
  },
  working: {
    name: "โซนทำงาน (Work Zone)",
    description: "พื้นที่สำหรับทำงานและศึกษา",
    essentialFurniture: ["desk-work", "office-chair"],
    optionalFurniture: ["folding-desk", "bookshelf"],
    fengShuiTips: [
      "โต๊ะทำงานควรหันหน้าไปทางประตู",
      "หลีกเลี่ยงการวางโต๊ะหันหลังให้ประตู",
      "ใช้แสงสว่างเพียงพอ",
    ],
  },
  dining: {
    name: "โซนทานอาหาร (Dining Zone)",
    description: "พื้นที่สำหรับทานอาหาร",
    essentialFurniture: ["dining-table", "dining-chair"],
    optionalFurniture: ["compact-dining-set"],
    fengShuiTips: [
      "วางโต๊ะอาหารใกล้ครัวหรือหน้าต่าง",
      "เลือกโต๊ะขนาดเล็กสำหรับ studio",
      "ใช้โต๊ะพับได้เพื่อประหยัดพื้นที่",
    ],
  },
  kitchen: {
    name: "โซนครัว (Kitchen Zone)",
    description: "พื้นที่สำหรับทำอาหาร",
    essentialFurniture: ["kitchen-counter", "mini-fridge"],
    optionalFurniture: ["microwave-stand"],
    fengShuiTips: [
      "แยกโซนครัวจากโซนนอน",
      "ใช้ระบบระบายอากาศที่ดี",
      "เก็บอุปกรณ์ครัวให้เป็นระเบียบ",
    ],
  },
  storage: {
    name: "โซนเก็บของ (Storage Zone)",
    description: "พื้นที่สำหรับเก็บสัมภาระ",
    essentialFurniture: ["compact-wardrobe", "wardrobe-large"],
    optionalFurniture: ["bookshelf", "shoe-cabinet", "coat-rack"],
    fengShuiTips: [
      "วางตู้เสื้อผ้าในตำแหน่งที่ไม่กีดขวาง",
      "ใช้พื้นที่ใต้เตียงเก็บของ",
      "จัดระเบียบให้เข้าถึงง่าย",
    ],
  },
}

export function getZoneRecommendations() {
  return STUDIO_ZONE_RECOMMENDATIONS
}

export function getFurnitureForZone(zoneType: string): FurnitureCatalogItem[] {
  const zone = STUDIO_ZONE_RECOMMENDATIONS[zoneType as keyof typeof STUDIO_ZONE_RECOMMENDATIONS]
  if (!zone) return []
  
  const allIds = [...zone.essentialFurniture, ...zone.optionalFurniture]
  return FURNITURE_CATALOG.filter((item) => allIds.includes(item.id))
}

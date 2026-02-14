import type { FurnitureCatalogItem } from "@/types/furniture"

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // Bedroom
  {
    id: "bed-queen",
    name: "Queen Bed",
    category: "bed",
    dimensions: { width: 1.6, depth: 2.0, height: 0.5 },
    min_clearance: 0.6,
    element: "wood",
    is_essential: true,
  },
  {
    id: "wardrobe-large",
    name: "Large Wardrobe",
    category: "wardrobe",
    dimensions: { width: 1.8, depth: 0.6, height: 2.0 },
    min_clearance: 0.8,
    element: "wood",
    is_essential: true,
  },
  {
    id: "nightstand",
    name: "Nightstand",
    category: "nightstand",
    dimensions: { width: 0.5, depth: 0.4, height: 0.55 },
    min_clearance: 0.3,
    element: "wood",
    is_essential: false,
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
  },
  {
    id: "tv-stand",
    name: "TV Stand",
    category: "tv_stand",
    dimensions: { width: 1.5, depth: 0.4, height: 0.5 },
    min_clearance: 0.6,
    element: "metal",
    is_essential: false,
  },
  {
    id: "bookshelf",
    name: "Bookshelf",
    category: "bookshelf",
    dimensions: { width: 0.8, depth: 0.3, height: 1.8 },
    min_clearance: 0.5,
    element: "wood",
    is_essential: false,
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
  },
  {
    id: "office-chair",
    name: "Office Chair",
    category: "chair",
    dimensions: { width: 0.6, depth: 0.6, height: 1.1 },
    min_clearance: 0.6,
    element: "metal",
    is_essential: true,
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
  },
  {
    id: "dining-chair",
    name: "Dining Chair",
    category: "dining_chair",
    dimensions: { width: 0.45, depth: 0.45, height: 0.9 },
    min_clearance: 0.5,
    element: "wood",
    is_essential: false,
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
  },
  {
    id: "floor-lamp",
    name: "Floor Lamp",
    category: "lamp",
    dimensions: { width: 0.3, depth: 0.3, height: 1.5 },
    min_clearance: 0.2,
    element: "fire",
    is_essential: false,
  },
  {
    id: "area-rug",
    name: "Area Rug",
    category: "rug",
    dimensions: { width: 2.0, depth: 1.5, height: 0.02 },
    min_clearance: 0,
    element: "earth",
    is_essential: false,
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

export function getCategorizedFurniture() {
  return Object.entries(CATEGORY_GROUPS).map(([group, categories]) => ({
    group,
    items: FURNITURE_CATALOG.filter((item) =>
      categories.includes(item.category)
    ),
  }))
}

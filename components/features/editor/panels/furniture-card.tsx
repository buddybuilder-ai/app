"use client"

import { Badge } from "@/components/ui/badge"
import type { FurnitureCatalogItem } from "@/types/furniture"

const CATEGORY_COLORS: Record<string, string> = {
  bed: "#8B7355",
  wardrobe: "#A0522D",
  nightstand: "#D2B48C",
  dresser: "#BC8F8F",
  sofa: "#6B8E9B",
  armchair: "#7B9EA8",
  coffee_table: "#DEB887",
  tv_stand: "#708090",
  bookshelf: "#CD853F",
  desk: "#D2B48C",
  chair: "#778899",
  dining_table: "#DEB887",
  dining_chair: "#D2B48C",
  plant: "#6B8E23",
  lamp: "#FFD700",
  rug: "#BC8F8F",
  // Studio-specific categories
  sofa_bed: "#7B9EA8",
  compact_wardrobe: "#A0522D",
  room_divider: "#CD853F",
  folding_desk: "#D2B48C",
  compact_dining: "#DEB887",
  kitchen_counter: "#708090",
  mini_fridge: "#778899",
  microwave_stand: "#708090",
  shoe_cabinet: "#A0522D",
  coat_rack: "#778899",
}

interface FurnitureCardProps {
  item: FurnitureCatalogItem
  onAdd: (item: FurnitureCatalogItem) => void
}

export function FurnitureCard({ item, onAdd }: FurnitureCardProps) {
  const color = CATEGORY_COLORS[item.category] || "#999999"

  return (
    <button
      type="button"
      className="group flex w-full items-center gap-3 rounded-lg border border-border p-2 text-left transition-colors hover:border-primary hover:bg-accent"
      onClick={() => onAdd(item)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/furniture-id", item.id)
        e.dataTransfer.effectAllowed = "copy"
      }}
    >
      {/* Color preview box */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: color }}
      >
        <span className="text-xs font-bold text-white">
          {item.dimensions.width.toFixed(1)}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{item.name}</p>
          {item.is_essential && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              Essential
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {item.dimensions.width}×{item.dimensions.depth}×
          {item.dimensions.height}m
        </p>
      </div>

      {/* Add indicator */}
      <span className="shrink-0 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        +
      </span>
    </button>
  )
}

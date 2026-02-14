"use client"

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
        <p className="truncate text-sm font-medium">{item.name}</p>
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

"use client"

import { useState } from "react"
import Image from "next/image"
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

function thumbnailUrl(modelUrl?: string | null): string | null {
  if (!modelUrl) return null
  const match = modelUrl.match(/([^/]+)\.glb$/i)
  if (!match) return null
  return `/furniture_thumbnails/${match[1]}.png`
}

interface FurnitureCardProps {
  item: FurnitureCatalogItem
  onAdd: (item: FurnitureCatalogItem) => void
}

export function FurnitureCard({ item, onAdd }: FurnitureCardProps) {
  const color = CATEGORY_COLORS[item.category] || "#999999"
  const thumb = thumbnailUrl(item.model_url)
  const [thumbFailed, setThumbFailed] = useState(false)
  const showThumb = thumb && !thumbFailed

  return (
    <button
      type="button"
      className="group flex w-full min-w-32 max-w-40 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-colors hover:border-primary hover:bg-accent"
      onClick={() => onAdd(item)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/furniture-id", item.id)
        e.dataTransfer.effectAllowed = "copy"
      }}
    >
      <div
        className="relative flex h-20 w-full shrink-0 items-center justify-center"
        style={showThumb ? undefined : { backgroundColor: color }}
      >
        {showThumb ? (
          <Image
            src={thumb}
            alt={item.name}
            width={128}
            height={80}
            className="h-full w-full object-contain"
            onError={() => setThumbFailed(true)}
            unoptimized
          />
        ) : (
          <span className="text-sm font-bold text-white">
            {item.dimensions.width.toFixed(1)}m
          </span>
        )}
        {item.is_essential && (
          <Badge
            variant="secondary"
            className="absolute right-1 top-1 h-4 px-1 text-[9px]"
          >
            จำเป็น
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-0.5 border-t px-2 py-1.5">
        <p className="line-clamp-2 text-xs font-medium leading-tight">
          {item.name}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {item.dimensions.width}×{item.dimensions.depth}m
        </p>
      </div>
    </button>
  )
}

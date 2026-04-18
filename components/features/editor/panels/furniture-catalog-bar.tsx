"use client"

import { useState, useMemo } from "react"
import { Search, ChevronUp, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  getCategorizedFurniture,
  getFurnitureById,
  getZoneRecommendations,
} from "@/lib/furniture-catalog"
import { useEditorStore } from "@/stores/editor-store"
import { FurnitureCard } from "./furniture-card"
import type { FurnitureCatalogItem } from "@/types/furniture"

export function FurnitureCatalogBar() {
  const [search, setSearch] = useState("")
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const addFurniture = useEditorStore((s) => s.addFurniture)
  const room = useEditorStore((s) => s.room)

  const categorized = useMemo(
    () => getCategorizedFurniture(room.room_type),
    [room.room_type]
  )

  const zoneRecommendations = useMemo(() => {
    if (room.room_type === "studio_apartment") return getZoneRecommendations()
    return null
  }, [room.room_type])

  const activeItems = useMemo(() => {
    let items: FurnitureCatalogItem[] = []
    if (activeGroup) {
      items = categorized.find((g) => g.group === activeGroup)?.items ?? []
    } else {
      items = categorized.flatMap((g) => g.items)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter((i) => i.name.toLowerCase().includes(q))
    }
    return items
  }, [categorized, activeGroup, search])

  function handleAdd(item: FurnitureCatalogItem) {
    addFurniture({
      id: item.id,
      instanceId: `${item.id}-${Date.now()}`,
      name: item.name,
      category: item.category,
      pos_x: 0,
      pos_y: 0,
      pos_z: 0,
      rotation: 0,
      dimensions: { ...item.dimensions },
      is_essential: item.is_essential,
      feng_shui_notes: [],
      model_url: item.model_url ?? undefined,
      model_rotation_offset: 0,
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const id = e.dataTransfer.getData("application/furniture-id")
    const item = getFurnitureById(id)
    if (item) handleAdd(item)
  }

  if (collapsed) {
    return (
      <div className="flex h-10 shrink-0 items-center justify-between border-t bg-background px-4">
        <span className="text-xs text-muted-foreground">
          คลังเฟอร์นิเจอร์ ({activeItems.length} ชิ้น)
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={() => setCollapsed(false)}
        >
          <ChevronUp className="h-3.5 w-3.5" />
          แสดง
        </Button>
      </div>
    )
  }

  return (
    <div
      className="flex h-56 shrink-0 flex-col border-t bg-background"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Tabs + search row */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <div className="flex flex-1 flex-wrap gap-1">
          <Button
            variant={activeGroup === null ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={() => setActiveGroup(null)}
          >
            ทั้งหมด
          </Button>
          {categorized.map((group) => (
            <Button
              key={group.group}
              variant={activeGroup === group.group ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setActiveGroup(group.group)}
            >
              {group.group}
              <span className="ml-1.5 text-[10px] opacity-60">
                {group.items.length}
              </span>
            </Button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="ค้นหา..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 w-48 pl-8 text-xs"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCollapsed(true)}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Horizontal scroll card strip */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-2 p-3">
          {activeItems.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              ไม่พบเฟอร์นิเจอร์
            </div>
          ) : (
            activeItems.map((item) => (
              <FurnitureCard key={item.id} item={item} onAdd={handleAdd} />
            ))
          )}
          {zoneRecommendations && !search.trim() && activeGroup === null && (
            <div className="sticky right-0 flex shrink-0 items-center text-[10px] text-muted-foreground/60">
              ←→ เลื่อน
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

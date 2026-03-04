"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, Search, Sofa, Lightbulb } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getCategorizedFurniture, getFurnitureById, getZoneRecommendations } from "@/lib/furniture-catalog"
import { useEditorStore } from "@/stores/editor-store"
import { useUIStore } from "@/stores/ui-store"
import { FurnitureCard } from "./furniture-card"
import type { FurnitureCatalogItem } from "@/types/furniture"

export function FurniturePanel() {
  const [search, setSearch] = useState("")
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const isOpen = useUIStore((s) => s.furniturePanelOpen)
  const toggle = useUIStore((s) => s.toggleFurniturePanel)
  const addFurniture = useEditorStore((s) => s.addFurniture)
  const room = useEditorStore((s) => s.room)

  // Get categorized furniture based on room type
  const categorized = useMemo(() => {
    return getCategorizedFurniture(room.room_type)
  }, [room.room_type])

  // Get zone recommendations for studio apartment
  const zoneRecommendations = useMemo(() => {
    if (room.room_type === "studio_apartment") {
      return getZoneRecommendations()
    }
    return null
  }, [room.room_type])

  // Filter by zone if selected (studio apartment only)
  const zoneFiltered = useMemo(() => {
    if (!selectedZone || room.room_type !== "studio_apartment") {
      return categorized
    }
    const zoneKey = selectedZone.toLowerCase().replace(" ", "_")
    const zoneData = zoneRecommendations?.[zoneKey as keyof typeof zoneRecommendations]
    if (!zoneData) return categorized
    
    const zoneFurnitureIds = [...zoneData.essentialFurniture, ...zoneData.optionalFurniture]
    return categorized
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => zoneFurnitureIds.includes(item.id)),
      }))
      .filter((group) => group.items.length > 0)
  }, [categorized, selectedZone, room.room_type, zoneRecommendations])

  const filtered = search.trim()
    ? zoneFiltered
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((group) => group.items.length > 0)
    : zoneFiltered

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
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const id = e.dataTransfer.getData("application/furniture-id")
    const item = getFurnitureById(id)
    if (item) handleAdd(item)
  }

  // Collapsed state - icon strip
  if (!isOpen) {
    return (
      <div className="fixed left-0 top-12 bottom-0 z-20 hidden w-12 flex-col items-center border-r bg-background pt-2 lg:flex">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggle}
            >
              <Sofa className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Furniture Panel</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div
      className="fixed left-0 top-12 bottom-0 z-20 hidden w-72 flex-col border-r bg-background lg:flex"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-semibold">Furniture</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={toggle}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="border-b px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search furniture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Zone filter for studio apartment */}
      {room.room_type === "studio_apartment" && zoneRecommendations && (
        <div className="border-b px-3 py-2">
          <div className="mb-2 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground">
              Filter by zone
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedZone === null ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setSelectedZone(null)}
            >
              All
            </Button>
            {Object.entries(zoneRecommendations).map(([key, zone]) => (
              <Button
                key={key}
                variant={selectedZone === key ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setSelectedZone(key)}
              >
                {zone.name.split(" ")[0]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Zone recommendations tips */}
      {room.room_type === "studio_apartment" && selectedZone && zoneRecommendations && (
        <div className="border-b bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
          <div className="mb-1 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {zoneRecommendations[selectedZone as keyof typeof zoneRecommendations]?.name}
            </span>
          </div>
          <p className="mb-2 text-xs text-amber-600 dark:text-amber-500">
            {zoneRecommendations[selectedZone as keyof typeof zoneRecommendations]?.description}
          </p>
          <div className="space-y-1">
            {zoneRecommendations[selectedZone as keyof typeof zoneRecommendations]?.fengShuiTips.map((tip, i) => (
              <p key={i} className="text-xs text-amber-600/80 dark:text-amber-500/80">
                • {tip}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Furniture list */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {filtered.map((group) => (
            <div key={group.group}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.group}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <FurnitureCard
                    key={item.id}
                    item={item}
                    onAdd={handleAdd}
                  />
                ))}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No furniture found
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

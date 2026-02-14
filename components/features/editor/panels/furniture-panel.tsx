"use client"

import { useState } from "react"
import { ChevronLeft, Search, Sofa } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getCategorizedFurniture, getFurnitureById } from "@/lib/furniture-catalog"
import { useEditorStore } from "@/stores/editor-store"
import { useUIStore } from "@/stores/ui-store"
import { FurnitureCard } from "./furniture-card"
import type { FurnitureCatalogItem } from "@/types/furniture"

export function FurniturePanel() {
  const [search, setSearch] = useState("")
  const isOpen = useUIStore((s) => s.furniturePanelOpen)
  const toggle = useUIStore((s) => s.toggleFurniturePanel)
  const addFurniture = useEditorStore((s) => s.addFurniture)

  const categorized = getCategorizedFurniture()

  const filtered = search.trim()
    ? categorized
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((group) => group.items.length > 0)
    : categorized

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
      <div className="fixed left-0 top-12 bottom-0 z-20 flex w-12 flex-col items-center border-r bg-background pt-2">
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
      className="fixed left-0 top-12 bottom-0 z-20 flex w-72 flex-col border-r bg-background"
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

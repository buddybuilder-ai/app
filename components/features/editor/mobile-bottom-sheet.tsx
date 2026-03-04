"use client"

import { useState, useMemo } from "react"
import { X, Search, RotateCw, Trash2, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUIStore } from "@/stores/ui-store"
import { useEditorStore } from "@/stores/editor-store"
import { getCategorizedFurniture } from "@/lib/furniture-catalog"
import { FurnitureCard } from "./panels/furniture-card"
import { ChatMessageList } from "@/components/features/chat/chat-message-list"
import { ChatInput } from "@/components/features/chat/chat-input"
import type { FurnitureCatalogItem } from "@/types/furniture"

const SHEET_LABELS: Record<string, string> = {
  furniture: "เฟอร์นิเจอร์",
  properties: "คุณสมบัติ",
  "feng-shui": "ฮ้วงจุ้ย",
  settings: "ตั้งค่าห้อง",
  chat: "BuddyBuilder AI",
}

export function MobileBottomSheet() {
  const activeSheet = useUIStore((s) => s.activeBottomSheet)
  const setActiveSheet = useUIStore((s) => s.setActiveBottomSheet)

  if (!activeSheet) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/30"
        onClick={() => setActiveSheet(null)}
      />

      {/* Sheet */}
      <div className="fixed bottom-14 left-0 right-0 z-40 flex h-[60vh] flex-col rounded-t-xl border-t bg-background shadow-2xl">
        {/* Handle + header */}
        <div className="relative flex items-center justify-between border-b px-4 py-2">
          <div className="absolute left-0 right-0 top-1.5 mx-auto h-1 w-10 rounded-full bg-muted-foreground/30" />
          <span className="pt-1 text-sm font-semibold">{SHEET_LABELS[activeSheet]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setActiveSheet(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {activeSheet === "furniture" && <InlineFurniturePanel />}
          {activeSheet === "properties" && <InlinePropertiesPanel />}
          {activeSheet === "feng-shui" && <InlineFengShuiPanel />}
          {activeSheet === "settings" && <InlineRoomSettingsPanel />}
          {activeSheet === "chat" && (
            <>
              <ChatMessageList />
              <ChatInput />
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Furniture panel
// ---------------------------------------------------------------------------

function InlineFurniturePanel() {
  const [search, setSearch] = useState("")
  const addFurniture = useEditorStore((s) => s.addFurniture)
  const room = useEditorStore((s) => s.room)
  const setActiveSheet = useUIStore((s) => s.setActiveBottomSheet)

  const categorized = useMemo(
    () => getCategorizedFurniture(room.room_type),
    [room.room_type]
  )

  const filtered = search.trim()
    ? categorized
        .map((g) => ({
          ...g,
          items: g.items.filter((i) =>
            i.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
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
      model_url: item.model_url ?? undefined,
      model_rotation_offset: 0,
    })
    setActiveSheet(null)
  }

  return (
    <>
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
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-3">
          {filtered.map((group) => (
            <div key={group.group}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.group}
              </h3>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <FurnitureCard key={item.id} item={item} onAdd={handleAdd} />
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
    </>
  )
}

// ---------------------------------------------------------------------------
// Properties panel
// ---------------------------------------------------------------------------

function InlinePropertiesPanel() {
  const selectedId = useEditorStore((s) => s.selectedId)
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const updateFurniture = useEditorStore((s) => s.updateFurniture)
  const removeFurniture = useEditorStore((s) => s.removeFurniture)
  const setActiveSheet = useUIStore((s) => s.setActiveBottomSheet)

  const item = furnitureItems.find((f) => f.instanceId === selectedId)

  if (!item)
    return (
      <p className="p-4 text-sm text-muted-foreground">เลือกเฟอร์นิเจอร์ก่อน</p>
    )

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-5 p-4">
        {/* Position */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Position
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(["pos_x", "pos_z"] as const).map((axis) => (
              <div key={axis} className="space-y-1">
                <Label className="text-xs">{axis === "pos_x" ? "X" : "Z"}</Label>
                <Input
                  type="number"
                  step={0.1}
                  value={item[axis]}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value)
                    if (!isNaN(n)) updateFurniture(item.instanceId, { [axis]: n })
                  }}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Rotation */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Rotation
          </h3>
          <div className="flex items-center gap-3">
            <RotateCw className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              value={[item.rotation]}
              onValueChange={([v]) =>
                updateFurniture(item.instanceId, { rotation: v })
              }
              min={0}
              max={359}
              step={15}
              className="flex-1"
            />
            <span className="w-10 text-right text-sm text-muted-foreground">
              {item.rotation}°
            </span>
          </div>
        </div>

        <Separator />

        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => {
            removeFurniture(item.instanceId)
            setActiveSheet(null)
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </ScrollArea>
  )
}

// ---------------------------------------------------------------------------
// Feng Shui panel
// ---------------------------------------------------------------------------

const SCORE_CATEGORIES = [
  { key: "command_position" as const, label: "Command Position", max: 30 },
  { key: "five_elements_balance" as const, label: "Five Elements", max: 20 },
  { key: "chi_flow" as const, label: "Chi Flow", max: 25 },
  { key: "sha_chi_avoidance" as const, label: "Sha Chi Avoidance", max: 25 },
]

function InlineFengShuiPanel() {
  const fengShuiScore = useEditorStore((s) => s.fengShuiScore)

  if (!fengShuiScore)
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <Compass className="h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Generate a layout to see Feng Shui analysis
        </p>
      </div>
    )

  const totalScore =
    fengShuiScore.command_position +
    fengShuiScore.five_elements_balance +
    fengShuiScore.chi_flow +
    fengShuiScore.sha_chi_avoidance

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-4 p-4">
        <div className="text-center">
          <span className="text-4xl font-bold">{totalScore}</span>
          <span className="text-muted-foreground">/100</span>
        </div>
        <Separator />
        {SCORE_CATEGORIES.map((cat) => {
          const pct = Math.round((fengShuiScore[cat.key] / cat.max) * 100)
          const color =
            pct >= 75
              ? "bg-green-500"
              : pct >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
          return (
            <div key={cat.key} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{cat.label}</span>
                <span className="font-medium">
                  {fengShuiScore[cat.key]}/{cat.max}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className={`h-1.5 rounded-full ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

// ---------------------------------------------------------------------------
// Room settings panel
// ---------------------------------------------------------------------------

function InlineRoomSettingsPanel() {
  const room = useEditorStore((s) => s.room)
  const setRoom = useEditorStore((s) => s.setRoom)

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-5 p-4">
        {/* Dimensions */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Dimensions (m)
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {(["width", "depth", "height"] as const).map((dim) => (
              <div key={dim} className="space-y-1">
                <Label className="text-xs capitalize">{dim}</Label>
                <Input
                  type="number"
                  step={0.5}
                  min={1}
                  value={room[dim]}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value)
                    if (!isNaN(n) && n > 0) setRoom({ ...room, [dim]: n })
                  }}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Room type */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Room Type
          </h3>
          <Select
            value={room.room_type}
            onValueChange={(v) =>
              setRoom({ ...room, room_type: v as typeof room.room_type })
            }
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "bedroom",
                "living_room",
                "office",
                "dining_room",
                "studio_apartment",
              ].map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ScrollArea>
  )
}

"use client"

import { X, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEditorStore } from "@/stores/editor-store"
import { useUIStore } from "@/stores/ui-store"
import { WALL_SIDES, STUDIO_ZONES } from "@/lib/constants"
import type { RoomConfig } from "@/types/editor"

type WallSide = "north" | "south" | "east" | "west"
type ZoneType =
  | "sleep"
  | "living"
  | "work"
  | "dining"
  | "kitchen"
  | "storage"
  | "entrance"

export function RoomSettingsPanel() {
  const room = useEditorStore((s) => s.room)
  const setRoom = useEditorStore((s) => s.setRoom)
  const isOpen = useUIStore((s) => s.roomSettingsPanelOpen)
  const toggle = useUIStore((s) => s.toggleRoomSettingsPanel)

  if (!isOpen) return null

  function updateRoom(updates: Partial<RoomConfig>) {
    setRoom({ ...room, ...updates })
  }

  function addDoor() {
    const doors = [...(room.doors ?? [])]
    doors.push({
      wall: "south" as WallSide,
      offset: 1.0,
      width: 0.9,
      swing_inward: true,
    })
    updateRoom({ doors })
  }

  function removeDoor(index: number) {
    const doors = (room.doors ?? []).filter((_, i) => i !== index)
    updateRoom({ doors })
  }

  function updateDoor(
    index: number,
    field: string,
    value: string | number
  ) {
    const doors = (room.doors ?? []).map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    )
    updateRoom({ doors })
  }

  function addWindow() {
    const windows = [...(room.windows ?? [])]
    windows.push({
      wall: "north" as WallSide,
      offset: 1.0,
      width: 1.5,
      height: 1.2,
      sill_height: 0.9,
    })
    updateRoom({ windows })
  }

  function removeWindow(index: number) {
    const windows = (room.windows ?? []).filter((_, i) => i !== index)
    updateRoom({ windows })
  }

  function updateWindow(
    index: number,
    field: string,
    value: string | number
  ) {
    const windows = (room.windows ?? []).map((w, i) =>
      i === index ? { ...w, [field]: value } : w
    )
    updateRoom({ windows })
  }

  function addZone() {
    const zones = [...(room.zones ?? [])]
    zones.push({
      id: `zone-${Date.now()}`,
      type: "living" as ZoneType,
      x: 0,
      z: 0,
      width: 2,
      depth: 2,
    })
    updateRoom({ zones })
  }

  function removeZone(index: number) {
    const zones = (room.zones ?? []).filter((_, i) => i !== index)
    updateRoom({ zones })
  }

  function updateZone(
    index: number,
    field: string,
    value: string | number
  ) {
    const zones = (room.zones ?? []).map((z, i) =>
      i === index ? { ...z, [field]: value } : z
    )
    updateRoom({ zones })
  }

  return (
    <div className="fixed right-0 top-12 bottom-0 z-20 flex w-80 flex-col border-l bg-background shadow-lg">
      {/* Header */}
      <div className="flex h-12 items-center justify-between border-b px-4">
        <h3 className="text-sm font-semibold">ตั้งค่าห้อง</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggle}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Room Dimensions */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              ขนาดห้อง
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">กว้าง (ม.)</Label>
                <Input
                  type="number"
                  value={room.width}
                  onChange={(e) =>
                    updateRoom({ width: Number(e.target.value) })
                  }
                  min={3}
                  max={15}
                  step={0.5}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">ลึก (ม.)</Label>
                <Input
                  type="number"
                  value={room.depth}
                  onChange={(e) =>
                    updateRoom({ depth: Number(e.target.value) })
                  }
                  min={3}
                  max={15}
                  step={0.5}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Direction */}
          <section className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              ทิศหน้าห้อง
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(WALL_SIDES).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    updateRoom({ direction: key as WallSide })
                  }
                  className={`rounded border p-1.5 text-center text-xs transition-colors ${
                    room.direction === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {value.labelTh}
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Doors */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                ประตู ({(room.doors ?? []).length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={addDoor}
              >
                <Plus className="mr-1 h-3 w-3" />
                เพิ่ม
              </Button>
            </div>
            {(room.doors ?? []).map((door, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    ประตู {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeDoor(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">ผนัง</Label>
                    <Select
                      value={door.wall}
                      onValueChange={(v) => updateDoor(i, "wall", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WALL_SIDES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.labelTh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ระยะ (ม.)</Label>
                    <Input
                      type="number"
                      value={door.offset}
                      onChange={(e) =>
                        updateDoor(i, "offset", Number(e.target.value))
                      }
                      min={0}
                      step={0.5}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <Separator />

          {/* Windows */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                หน้าต่าง ({(room.windows ?? []).length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={addWindow}
              >
                <Plus className="mr-1 h-3 w-3" />
                เพิ่ม
              </Button>
            </div>
            {(room.windows ?? []).map((win, i) => (
              <div
                key={i}
                className="space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">
                    หน้าต่าง {i + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => removeWindow(i)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">ผนัง</Label>
                    <Select
                      value={win.wall}
                      onValueChange={(v) => updateWindow(i, "wall", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(WALL_SIDES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.labelTh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ระยะ (ม.)</Label>
                    <Input
                      type="number"
                      value={win.offset}
                      onChange={(e) =>
                        updateWindow(i, "offset", Number(e.target.value))
                      }
                      min={0}
                      step={0.5}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">กว้าง (ม.)</Label>
                    <Input
                      type="number"
                      value={win.width}
                      onChange={(e) =>
                        updateWindow(i, "width", Number(e.target.value))
                      }
                      min={0.5}
                      step={0.5}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">สูง (ม.)</Label>
                    <Input
                      type="number"
                      value={win.height}
                      onChange={(e) =>
                        updateWindow(i, "height", Number(e.target.value))
                      }
                      min={0.5}
                      step={0.1}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <Separator />

          {/* Zones (Studio only) */}
          {room.room_type === "studio_apartment" && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  โซน ({(room.zones ?? []).length})
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={addZone}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  เพิ่ม
                </Button>
              </div>
              {(room.zones ?? []).map((zone, i) => (
                <div
                  key={zone.id}
                  className="space-y-2 rounded-lg border p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      โซน {i + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => removeZone(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">ประเภท</Label>
                    <Select
                      value={zone.type}
                      onValueChange={(v) => updateZone(i, "type", v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STUDIO_ZONES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>
                            {v.labelTh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">X</Label>
                      <Input
                        type="number"
                        value={zone.x}
                        onChange={(e) =>
                          updateZone(i, "x", Number(e.target.value))
                        }
                        step={0.5}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Z</Label>
                      <Input
                        type="number"
                        value={zone.z}
                        onChange={(e) =>
                          updateZone(i, "z", Number(e.target.value))
                        }
                        step={0.5}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">กว้าง</Label>
                      <Input
                        type="number"
                        value={zone.width}
                        onChange={(e) =>
                          updateZone(i, "width", Number(e.target.value))
                        }
                        min={0.5}
                        step={0.5}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">ลึก</Label>
                      <Input
                        type="number"
                        value={zone.depth}
                        onChange={(e) =>
                          updateZone(i, "depth", Number(e.target.value))
                        }
                        min={0.5}
                        step={0.5}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

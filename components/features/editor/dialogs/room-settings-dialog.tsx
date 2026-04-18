"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEditorStore } from "@/stores/editor-store"
import { useUIStore } from "@/stores/ui-store"
import { WALL_SIDES } from "@/lib/constants"
import type { RoomConfig } from "@/types/editor"
import { toast } from "sonner"

type WallSide = "north" | "south" | "east" | "west"

interface RoomSettingsDialogProps {
  projectId: string
}

export function RoomSettingsDialog({ projectId }: RoomSettingsDialogProps) {
  const room = useEditorStore((s) => s.room)
  const setRoom = useEditorStore((s) => s.setRoom)
  const open = useUIStore((s) => s.roomSettingsPanelOpen)
  const toggle = useUIStore((s) => s.toggleRoomSettingsPanel)

  // Local draft so the editor canvas doesn't update live on every keystroke —
  // changes commit on "Save". Cancel simply closes without touching state.
  const [draft, setDraft] = useState<RoomConfig>(room)
  const [isSaving, setIsSaving] = useState(false)

  function onOpenChange(next: boolean) {
    if (next) {
      setDraft(room) // re-sync every time the dialog opens
    }
    if (next !== open) toggle()
  }

  function updateRoom(updates: Partial<RoomConfig>) {
    setDraft((prev) => ({ ...prev, ...updates }))
  }

  function addDoor() {
    updateRoom({
      doors: [
        ...(draft.doors ?? []),
        { wall: "south", offset: 1.0, width: 0.9, swing_inward: true },
      ],
    })
  }

  function removeDoor(i: number) {
    updateRoom({ doors: (draft.doors ?? []).filter((_, idx) => idx !== i) })
  }

  function updateDoor(i: number, field: string, value: string | number) {
    updateRoom({
      doors: (draft.doors ?? []).map((d, idx) =>
        idx === i ? { ...d, [field]: value } : d
      ),
    })
  }

  function addWindow() {
    updateRoom({
      windows: [
        ...(draft.windows ?? []),
        { wall: "north", offset: 1.0, width: 1.5, height: 1.2, sill_height: 0.9 },
      ],
    })
  }

  function removeWindow(i: number) {
    updateRoom({
      windows: (draft.windows ?? []).filter((_, idx) => idx !== i),
    })
  }

  function updateWindow(i: number, field: string, value: string | number) {
    updateRoom({
      windows: (draft.windows ?? []).map((w, idx) =>
        idx === i ? { ...w, [field]: value } : w
      ),
    })
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      // Commit to client store first so the canvas reflects changes immediately.
      setRoom(draft)
      // Persist room_spec to backend (separate from layout save flow).
      const resp = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_spec: draft }),
      })
      if (resp.ok) toast.success("บันทึกการตั้งค่าห้องแล้ว")
      else toast.error("บันทึกไม่สำเร็จ")
    } catch {
      toast.error("บันทึกไม่สำเร็จ")
    } finally {
      setIsSaving(false)
      toggle()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>แก้ไขห้อง</DialogTitle>
          <DialogDescription>
            ปรับขนาด ทิศทาง ตำแหน่งประตู และหน้าต่างของห้อง
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-5 pr-4">
            {/* Dimensions */}
            <section className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                ขนาดห้อง
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="rd-w" className="text-xs">
                    กว้าง (ม.)
                  </Label>
                  <Input
                    id="rd-w"
                    type="number"
                    min={3}
                    max={15}
                    step={0.5}
                    value={draft.width}
                    onChange={(e) => updateRoom({ width: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="rd-d" className="text-xs">
                    ลึก (ม.)
                  </Label>
                  <Input
                    id="rd-d"
                    type="number"
                    min={3}
                    max={15}
                    step={0.5}
                    value={draft.depth}
                    onChange={(e) => updateRoom({ depth: Number(e.target.value) })}
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Direction */}
            <section className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                ทิศหน้าห้อง
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(WALL_SIDES).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateRoom({ direction: key as WallSide })}
                    className={`rounded border p-2 text-center text-sm transition-colors ${
                      draft.direction === key
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
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  ประตู ({(draft.doors ?? []).length})
                </Label>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={addDoor}>
                  <Plus className="mr-1 h-3 w-3" />
                  เพิ่ม
                </Button>
              </div>
              {(draft.doors ?? []).map((door, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">ประตู {i + 1}</span>
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
                      <Select value={door.wall} onValueChange={(v) => updateDoor(i, "wall", v)}>
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
                      <Label className="text-xs">ระยะจากมุม (ม.)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={door.offset}
                        onChange={(e) => updateDoor(i, "offset", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <Separator />

            {/* Windows */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">
                  หน้าต่าง ({(draft.windows ?? []).length})
                </Label>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={addWindow}>
                  <Plus className="mr-1 h-3 w-3" />
                  เพิ่ม
                </Button>
              </div>
              {(draft.windows ?? []).map((win, i) => (
                <div key={i} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">หน้าต่าง {i + 1}</span>
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
                        min={0}
                        step={0.5}
                        value={win.offset}
                        onChange={(e) => updateWindow(i, "offset", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">กว้าง (ม.)</Label>
                      <Input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={win.width}
                        onChange={(e) => updateWindow(i, "width", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">สูง (ม.)</Label>
                      <Input
                        type="number"
                        min={0.5}
                        step={0.1}
                        value={win.height}
                        onChange={(e) => updateWindow(i, "height", Number(e.target.value))}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            <Separator />

            {/* Feng shui personal info */}
            <section className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">
                ข้อมูลฮวงจุ้ย (กัว)
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">ปีเกิด (ค.ศ.)</Label>
                  <Input
                    type="number"
                    min={1900}
                    max={2100}
                    placeholder="เช่น 1990"
                    value={draft.user_preferences?.birth_year ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                      updateRoom({
                        user_preferences: {
                          ...draft.user_preferences,
                          birth_year: val ? Number(val) : undefined,
                        },
                      })
                    }}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">เพศ</Label>
                  <Select
                    value={draft.user_preferences?.gender ?? ""}
                    onValueChange={(v) =>
                      updateRoom({
                        user_preferences: {
                          ...draft.user_preferences,
                          gender: v as "male" | "female",
                        },
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="เลือก" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ชาย</SelectItem>
                      <SelectItem value="female">หญิง</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={toggle} disabled={isSaving}>
            ยกเลิก
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

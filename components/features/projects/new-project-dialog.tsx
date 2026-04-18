"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STUDIO_PRESETS, WALL_SIDES } from "@/lib/constants"
import { useProjectManager } from "@/hooks/use-project-manager"
import type { RoomConfig } from "@/types/editor"

type PresetKey = "small" | "medium" | "large" | "custom"
type WallSide = "north" | "south" | "east" | "west"

interface NewProjectDialogProps {
  /** Optional custom trigger. Defaults to a button labelled "โปรเจคใหม่". */
  trigger?: React.ReactNode
}

export function NewProjectDialog({ trigger }: NewProjectDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { createProject } = useProjectManager()

  const [name, setName] = useState("")
  const [preset, setPreset] = useState<PresetKey>("small")
  const [width, setWidth] = useState(6)
  const [depth, setDepth] = useState(4)
  const [doorWall, setDoorWall] = useState<WallSide>("south")
  const [doorOffset, setDoorOffset] = useState(1.0)
  const [windowWall, setWindowWall] = useState<WallSide>("north")
  const [windowOffset, setWindowOffset] = useState(2.0)
  const [windowWidth, setWindowWidth] = useState(1.5)
  const [direction, setDirection] = useState<WallSide>("north")

  function handlePresetChange(value: PresetKey) {
    setPreset(value)
    if (value !== "custom") {
      const p = STUDIO_PRESETS[value]
      setWidth(p.width)
      setDepth(p.depth)
      setDoorWall(p.doors[0].wall)
      setDoorOffset(p.doors[0].offset)
      setWindowWall(p.windows[0].wall)
      setWindowOffset(p.windows[0].offset)
      setWindowWidth(p.windows[0].width)
    }
  }

  async function handleCreate() {
    const roomConfig: RoomConfig = {
      width,
      depth,
      height: 2.8,
      room_type: "studio_apartment",
      doors: [
        {
          wall: doorWall,
          offset: doorOffset,
          width: 0.9,
          swing_inward: true,
        },
      ],
      windows: [
        {
          wall: windowWall,
          offset: windowOffset,
          width: windowWidth,
          height: 1.2,
          sill_height: 0.9,
        },
      ],
      direction,
      zones: [],
    }
    try {
      const id = await createProject(name || "ออกแบบสตูดิโอ", roomConfig)
      setOpen(false)
      router.push(`/editor/${id}`)
    } catch {
      // createProject throws on network error — keep dialog open
    }
  }

  const isCustom = preset === "custom"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            โปรเจคใหม่
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>สร้างโปรเจกต์ใหม่</DialogTitle>
          <DialogDescription>
            ตั้งค่าห้องสตูดิโอของคุณเพื่อเริ่มออกแบบ
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">ชื่อโปรเจกต์</Label>
            <Input
              id="projectName"
              placeholder="ออกแบบสตูดิโอ"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Studio Preset */}
          <div className="space-y-2">
            <Label>ขนาดห้อง</Label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { key: "small", label: "เล็ก", sub: "24 ตร.ม." },
                  { key: "medium", label: "กลาง", sub: "28 ตร.ม." },
                  { key: "large", label: "ใหญ่", sub: "35 ตร.ม." },
                  { key: "custom", label: "กำหนดเอง", sub: "" },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => handlePresetChange(p.key)}
                  className={`rounded-lg border p-2 text-center text-sm transition-colors ${
                    preset === p.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="font-medium">{p.label}</div>
                  {p.sub && (
                    <div className="text-xs text-muted-foreground">{p.sub}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dimensions (always visible, editable when custom) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">กว้าง (ม.)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={3}
                max={15}
                step={0.5}
                disabled={!isCustom}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">ลึก (ม.)</Label>
              <Input
                id="depth"
                type="number"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                min={3}
                max={15}
                step={0.5}
                disabled={!isCustom}
              />
            </div>
          </div>

          {/* Door Position */}
          <div className="space-y-2">
            <Label>ตำแหน่งประตู</Label>
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={doorWall}
                onValueChange={(v) => setDoorWall(v as WallSide)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WALL_SIDES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.labelTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={doorOffset}
                onChange={(e) => setDoorOffset(Number(e.target.value))}
                min={0}
                step={0.5}
                placeholder="ระยะจากขอบ (ม.)"
              />
            </div>
          </div>

          {/* Window Position */}
          <div className="space-y-2">
            <Label>ตำแหน่งหน้าต่าง</Label>
            <div className="grid grid-cols-3 gap-3">
              <Select
                value={windowWall}
                onValueChange={(v) => setWindowWall(v as WallSide)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WALL_SIDES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.labelTh}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={windowOffset}
                onChange={(e) => setWindowOffset(Number(e.target.value))}
                min={0}
                step={0.5}
                placeholder="ระยะ (ม.)"
              />
              <Input
                type="number"
                value={windowWidth}
                onChange={(e) => setWindowWidth(Number(e.target.value))}
                min={0.5}
                max={3}
                step={0.5}
                placeholder="กว้าง (ม.)"
              />
            </div>
          </div>

          {/* Facing Direction */}
          <div className="space-y-2">
            <Label>ทิศหน้าห้อง</Label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(WALL_SIDES).map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDirection(key as WallSide)}
                  className={`rounded-lg border p-2 text-center text-sm transition-colors ${
                    direction === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {value.labelTh}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleCreate}>สร้างโปรเจกต์</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

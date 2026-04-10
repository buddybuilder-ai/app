"use client"

import { X, RotateCw, Trash2, AlertTriangle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { useEditorStore } from "@/stores/editor-store"
import { validateFengShui, type FengShuiViolation } from "@/lib/feng-shui-validator"

export function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.selectedId)
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const room = useEditorStore((s) => s.room)
  const updateFurniture = useEditorStore((s) => s.updateFurniture)
  const removeFurniture = useEditorStore((s) => s.removeFurniture)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)

  const item = furnitureItems.find((f) => f.instanceId === selectedId)

  if (!item) return null

  // Validate feng shui for selected item
  const violations = validateFengShui(item, room, furnitureItems)

  function handlePositionChange(
    axis: "pos_x" | "pos_y" | "pos_z",
    value: string
  ) {
    const num = parseFloat(value)
    if (!isNaN(num) && item) {
      updateFurniture(item.instanceId, { [axis]: num })
    }
  }

  function handleRotationChange(value: number[]) {
    if (item) {
      updateFurniture(item.instanceId, { rotation: value[0] })
    }
  }

  function handleDelete() {
    if (item) {
      removeFurniture(item.instanceId)
    }
  }

  return (
    <div className="fixed right-0 top-12 bottom-0 z-20 hidden w-80 flex-col border-l bg-background lg:flex">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="text-sm font-semibold">{item.name}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setSelectedId(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {/* Position */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            ตำแหน่ง
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                step={0.1}
                value={item.pos_x}
                onChange={(e) => handlePositionChange("pos_x", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                step={0.1}
                value={item.pos_y}
                onChange={(e) => handlePositionChange("pos_y", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Z</Label>
              <Input
                type="number"
                step={0.1}
                value={item.pos_z}
                onChange={(e) => handlePositionChange("pos_z", e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Rotation */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            การหมุน
          </h3>
          <div className="flex items-center gap-3">
            <RotateCw className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Slider
              value={[item.rotation]}
              onValueChange={handleRotationChange}
              min={0}
              max={359}
              step={15}
              className="flex-1"
            />
            <div className="relative">
              <span className="absolute right-0 top-0 -translate-y-1/2 text-sm text-muted-foreground">
                °
              </span>
              <Input 
                value={item.rotation} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0
                  if (val >= 0 && val <= 359) {
                    updateFurniture(item.instanceId, { rotation: val })
                  }
                }}
                className="h-8 w-16 pr-6 text-right" 
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Dimensions (read-only) */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            ขนาด
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">กว้าง</Label>
              <p className="text-sm">{item.dimensions.width}m</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">ลึก</Label>
              <p className="text-sm">{item.dimensions.depth}m</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">สูง</Label>
              <p className="text-sm">{item.dimensions.height}m</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Info */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            ข้อมูล
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">หมวดหมู่</span>
              <span className="capitalize">
                {item.category.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">จำเป็น</span>
              <span>{item.is_essential ? "ใช่" : "ไม่"}</span>
            </div>
          </div>
        </div>

        {/* Feng Shui Violations */}
        <Separator />
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            ปัญหาฮวงจุ้ย
          </h3>
          {violations.length === 0 ? (
            <div className="flex items-center gap-2 rounded-md bg-green-50 p-2 text-xs text-green-700 dark:bg-green-950 dark:text-green-300">
              <span>✓</span>
              <span>ไม่มีปัญหาฮวงจุ้ย</span>
            </div>
          ) : (
            <div className="space-y-2">
              {violations.map((violation, index) => (
                <div
                  key={`${violation.rule_id}-${index}`}
                  className={`rounded-md p-2 text-xs ${
                    violation.severity === "error"
                      ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  <div className="font-medium">{violation.message}</div>
                  <div className="mt-1 opacity-80">
                    {violation.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Original Feng Shui Notes (if any) */}
        {item.feng_shui_notes.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                บันทึกฮวงจุ้ย
              </h3>
              <ul className="space-y-1">
                {item.feng_shui_notes.map((note, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    • {note}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Delete button */}
      <div className="border-t p-3">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          ลบ
        </Button>
      </div>
    </div>
  )
}

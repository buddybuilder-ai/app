"use client"

import Link from "next/link"
import { Box, Compass, MoreHorizontal, Pencil, Ruler, Trash2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FurnitureLite {
  furniture_id?: string
  catalog_id?: string
  type?: string
  category?: string
  name?: string
}

interface ProjectCardProps {
  id: string
  name: string
  roomType: string
  roomSpec: Record<string, unknown>
  layout: Record<string, unknown>[] | null
  previewImage: string | null
  updatedAt: string
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
}

const DIRECTION_LABELS: Record<string, string> = {
  north: "เหนือ",
  south: "ใต้",
  east: "ตะวันออก",
  west: "ตะวันตก",
}

const CATEGORY_LABELS: Record<string, string> = {
  bed: "เตียง",
  sofa: "โซฟา",
  wardrobe: "ตู้เสื้อผ้า",
  desk: "โต๊ะทำงาน",
  dining_table: "โต๊ะกินข้าว",
  coffee_table: "โต๊ะกลาง",
  tv_stand: "ชั้นวางทีวี",
  bookshelf: "ชั้นหนังสือ",
  chair: "เก้าอี้",
  armchair: "อาร์มแชร์",
  dresser: "ตู้ลิ้นชัก",
  nightstand: "โต๊ะข้างเตียง",
  plant: "ต้นไม้",
  lamp: "โคมไฟ",
  rug: "พรม",
}

function describeItem(item: FurnitureLite): string {
  const raw = item.category ?? item.type ?? item.catalog_id ?? item.furniture_id ?? ""
  const key = raw.split(/[-_]/)[0]
  return CATEGORY_LABELS[key] ?? key ?? "เฟอร์นิเจอร์"
}

function summariseLayout(layout: Record<string, unknown>[] | null): {
  count: number
  chips: string[]
  overflow: number
} {
  if (!layout || layout.length === 0) return { count: 0, chips: [], overflow: 0 }
  const seen = new Map<string, number>()
  for (const it of layout as FurnitureLite[]) {
    const label = describeItem(it)
    seen.set(label, (seen.get(label) ?? 0) + 1)
  }
  const entries = Array.from(seen.entries())
  const chips = entries.slice(0, 3).map(([label, n]) => (n > 1 ? `${label} ×${n}` : label))
  return { count: layout.length, chips, overflow: Math.max(0, entries.length - 3) }
}

export function ProjectCard({
  id,
  name,
  roomType,
  roomSpec,
  layout,
  previewImage,
  updatedAt,
  onDelete,
  onRename,
}: ProjectCardProps) {
  const width = typeof roomSpec.width === "number" ? (roomSpec.width as number) : null
  const depth = typeof roomSpec.depth === "number" ? (roomSpec.depth as number) : null
  const direction = typeof roomSpec.direction === "string" ? (roomSpec.direction as string) : null
  const zones = Array.isArray(roomSpec.zones) ? (roomSpec.zones as Record<string, unknown>[]) : []
  const { count, chips, overflow } = summariseLayout(layout)

  function handleRename() {
    const newName = window.prompt("ชื่อโปรเจกต์ใหม่:", name)
    if (newName && newName !== name) {
      onRename(id, newName)
    }
  }

  function handleDelete() {
    if (window.confirm(`ลบโปรเจกต์ "${name}" ?`)) {
      onDelete(id)
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/editor/${id}`}
        aria-label={`เปิดโปรเจกต์ ${name}`}
        className="absolute inset-0 z-0"
      />

      <CardHeader className="p-0">
        <div className="relative flex h-28 items-center justify-center overflow-hidden bg-muted">
          {previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewImage}
              alt={`ภาพแสดงตัวอย่างห้อง ${name}`}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <Box className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{name}</h3>
            <p className="text-xs text-muted-foreground">{roomType}</p>
          </div>
          <div
            className="relative z-10"
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRename}>
                  <Pencil className="mr-2 h-4 w-4" />
                  เปลี่ยนชื่อ
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  ลบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
          {width != null && depth != null && (
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {width.toFixed(1)}×{depth.toFixed(1)}ม.
            </span>
          )}
          {direction && (
            <span className="inline-flex items-center gap-1">
              <Compass className="h-3 w-3" />
              {DIRECTION_LABELS[direction] ?? direction}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Box className="h-3 w-3" />
            {count}
          </span>
          {zones.length > 0 && <span>{zones.length} โซน</span>}
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {c}
              </span>
            ))}
            {overflow > 0 && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                +{overflow}
              </span>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t px-3 py-1.5">
        <p className="text-[10px] text-muted-foreground">{updatedAt}</p>
      </CardFooter>
    </Card>
  )
}

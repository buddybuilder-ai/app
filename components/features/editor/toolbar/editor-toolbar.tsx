"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import {
  Save,
  Undo2,
  Redo2,
  Upload,
  FileImage,
  FileJson,
  Pencil,
  Home,
  MoreHorizontal,
  Trash2,
  Check,
  Loader2,
  AlertCircle,
  MessageSquare,
  FolderKanban,
  LogOut,
  Settings,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/auth-store"
import { buildDefaultBed } from "@/hooks/use-project"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUIStore } from "@/stores/ui-store"
import { useProject } from "@/hooks/use-project"
import { useEditorStore } from "@/stores/editor-store"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { RoomConfigSchema } from "@/types/schemas/room"
import { PlacedFurnitureItemSchema } from "@/types/schemas/furniture"
import { toast } from "sonner"

interface EditorToolbarProps {
  projectId: string
}

const ImportedItemSchema = PlacedFurnitureItemSchema.extend({
  instanceId: z.string().optional(),
  model_url: z.string().optional(),
})

const ImportFileSchema = z.object({
  name: z.string().optional(),
  room: RoomConfigSchema,
  furnitureItems: z.array(ImportedItemSchema).default([]),
})

function formatRelativeTime(ts: number, now: number): string {
  const diff = Math.max(0, Math.floor((now - ts) / 1000))
  if (diff < 5) return "เมื่อสักครู่"
  if (diff < 60) return `${diff} วิที่แล้ว`
  const min = Math.floor(diff / 60)
  if (min < 60) return `${min} นาทีที่แล้ว`
  const hr = Math.floor(min / 60)
  return `${hr} ชม.ที่แล้ว`
}

function SaveStatusIndicator() {
  const status = useEditorStore((s) => s.saveStatus)
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(t)
  }, [])

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        กำลังบันทึก...
      </span>
    )
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <AlertCircle className="h-3 w-3" />
        บันทึกไม่สำเร็จ
      </span>
    )
  }
  if (status === "dirty") {
    return <span className="text-xs text-muted-foreground">แก้ไขแล้ว</span>
  }
  if (status === "saved" && lastSavedAt) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Check className="h-3 w-3 text-green-500" />
        บันทึก{formatRelativeTime(lastSavedAt, now)}
      </span>
    )
  }
  return null
}

export function EditorToolbar({ projectId }: EditorToolbarProps) {
  const toggleRoomSettings = useUIStore((s) => s.toggleRoomSettingsPanel)
  const roomSettingsOpen = useUIStore((s) => s.roomSettingsPanelOpen)

  const { save, name, rename } = useProject(projectId)
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const logout = useAuthStore((s) => s.logout)
  useEffect(() => {
    if (!user) fetchMe()
  }, [user, fetchMe])
  const initials = user?.display_name
    ? user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const pastLen = useEditorStore((s) => s.past.length)
  const futureLen = useEditorStore((s) => s.future.length)
  const canUndo = pastLen > 0
  const canRedo = futureLen > 0
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const room = useEditorStore((s) => s.room)
  const setRoom = useEditorStore((s) => s.setRoom)
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useKeyboardShortcuts({ onUndo: undo, onRedo: redo })

  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState("")
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEditing() {
    setDraftName(name ?? "")
    setEditingName(true)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function handleSave() {
    const ok = save()
    if (ok) toast.success("บันทึกแล้ว")
    else toast.error("บันทึกไม่สำเร็จ")
  }

  function commitRename() {
    if (draftName.trim() && draftName.trim() !== name) {
      rename(draftName).then((ok) => {
        if (ok) toast.success("เปลี่ยนชื่อแล้ว")
      })
    }
    setEditingName(false)
  }

  // The "export image" menu item now opens the render workspace so users can
  // pick a camera angle and generate a photoreal preview. The raw PNG export
  // is still available through the canvas itself if needed.

  function exportJson() {
    const data = { name, room, furnitureItems }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name ?? "layout"}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("ส่งออก JSON แล้ว")
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      const parsed = ImportFileSchema.parse(JSON.parse(text))
      const withIds = parsed.furnitureItems.map((item, i) => ({
        ...item,
        instanceId: item.instanceId ?? `${item.id}-${Date.now()}-${i}`,
      }))
      setRoom(parsed.room)
      setFurnitureItems(withIds)
      if (parsed.name) {
        setProjectName(parsed.name)
        rename(parsed.name).catch(() => {/* best effort */})
      }
      toast.success(
        withIds.length > 0
          ? `นำเข้าสำเร็จ (${withIds.length} ชิ้น)`
          : "นำเข้าสำเร็จ (ไฟล์ไม่มีเฟอร์นิเจอร์)"
      )
    } catch (err) {
      const msg = err instanceof z.ZodError ? "รูปแบบไฟล์ไม่ถูกต้อง" : "อ่านไฟล์ไม่สำเร็จ"
      toast.error(msg)
      console.error("import error:", err)
    }
  }

  function triggerImport() {
    fileInputRef.current?.click()
  }

  function requestClearLayout() {
    if (furnitureItems.length === 0) {
      toast.info("ห้องว่างอยู่แล้ว")
      return
    }
    setClearDialogOpen(true)
  }

  function confirmClearLayout() {
    // Reset to just the seed bed so the AI pipeline always has an anchor;
    // a fully empty scene is blocked by the editor store.
    const seed = buildDefaultBed(room)
    setFurnitureItems(seed ? [seed] : furnitureItems.slice(0, 1))
    setClearDialogOpen(false)
    toast.success("ล้างห้องแล้ว (เหลือเตียงเริ่มต้น)")
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-30 flex h-10 items-center gap-1 border-b bg-background px-2 lg:h-12 lg:gap-2 lg:px-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/projects"
            className="flex items-center gap-2 text-sm font-bold"
            aria-label="กลับหน้าโปรเจกต์"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary transition-opacity hover:opacity-80">
              <span className="text-xs font-bold text-primary-foreground">B</span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent>กลับหน้าโปรเจกต์</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {editingName ? (
        <Input
          ref={inputRef}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename()
            if (e.key === "Escape") setEditingName(false)
          }}
          className="h-7 w-48 text-sm"
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium hover:bg-accent"
          disabled={!name}
        >
          <span className="max-w-[160px] truncate lg:max-w-[220px]">
            {name ?? "กำลังโหลด..."}
          </span>
          <Pencil className="h-3 w-3 opacity-40" />
        </button>
      )}

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>ย้อนกลับ (⌘Z)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>ทำซ้ำ (⌘⇧Z)</TooltipContent>
      </Tooltip>

      <div className="hidden flex-1 items-center justify-center lg:flex">
        <SaveStatusIndicator />
      </div>
      <div className="flex-1 lg:hidden" />

      <Button
        variant={roomSettingsOpen ? "secondary" : "ghost"}
        size="sm"
        className="h-8 gap-1.5"
        onClick={toggleRoomSettings}
      >
        <Home className="h-4 w-4" />
        <span className="hidden text-xs lg:inline">ห้อง</span>
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
      />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>เมนูเพิ่มเติม</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={triggerImport}>
            <Upload className="mr-2 h-4 w-4" />
            นำเข้าไฟล์ (JSON)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportJson}>
            <FileJson className="mr-2 h-4 w-4" />
            ส่งออกเป็น JSON
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/editor/${projectId}/render`} className="flex items-center gap-2">
              <FileImage className="mr-2 h-4 w-4" />
              ส่งออกเป็นรูปภาพ
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={requestClearLayout}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            ล้างเฟอร์นิเจอร์ทั้งหมด
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="default"
        size="sm"
        className="h-8 gap-1.5"
        onClick={handleSave}
      >
        <Save className="h-4 w-4" />
        <span className="hidden text-xs lg:inline">บันทึก</span>
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                aria-label="เมนูผู้ใช้"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{user?.display_name ?? "ผู้ใช้"}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-52">
          {user?.email && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              <p className="truncate font-medium text-foreground">
                {user.display_name}
              </p>
              <p className="truncate">{user.email}</p>
            </div>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/projects" className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              โปรเจกต์ทั้งหมด
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              ไปที่แชท
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              ตั้งค่า
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>ล้างเฟอร์นิเจอร์ทั้งหมด?</DialogTitle>
            <DialogDescription>
              จะลบเฟอร์นิเจอร์ {furnitureItems.length} ชิ้นในห้องนี้ และเหลือเตียงเริ่มต้นไว้ 1 ชิ้น
              คุณสามารถกดย้อนกลับ (⌘Z) เพื่อนำกลับมาได้
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={confirmClearLayout}>
              ล้างทั้งหมด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

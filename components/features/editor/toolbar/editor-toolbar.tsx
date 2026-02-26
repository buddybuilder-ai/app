"use client"

import Link from "next/link"
import {
  MousePointer2,
  Move,
  RotateCcw,
  Trash2,
  Undo2,
  Redo2,
  Save,
  Eye,
  Box,
  Settings2,
  Sparkles,
  Square,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useEditorStore } from "@/stores/editor-store"
import { useUIStore } from "@/stores/ui-store"
import { useProject } from "@/hooks/use-project"
import { useUndoRedo } from "@/hooks/use-undo-redo"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useLayoutPipeline } from "@/hooks/use-layout-pipeline"
import type { ActiveTool } from "@/types/editor"
import { toast } from "sonner"

const tools: {
  id: ActiveTool
  icon: typeof MousePointer2
  label: string
}[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "move", icon: Move, label: "Move" },
  { id: "rotate", icon: RotateCcw, label: "Rotate" },
  { id: "delete", icon: Trash2, label: "Delete" },
]

interface EditorToolbarProps {
  projectId: string
}

export function EditorToolbar({ projectId }: EditorToolbarProps) {
  const activeTool = useEditorStore((s) => s.activeTool)
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const viewMode = useEditorStore((s) => s.viewMode)
  const setViewMode = useEditorStore((s) => s.setViewMode)
  const toggleRoomSettings = useUIStore((s) => s.toggleRoomSettingsPanel)

  const { save } = useProject(projectId)
  const { undo, redo, canUndo, canRedo } = useUndoRedo()
  useKeyboardShortcuts({ onUndo: undo, onRedo: redo })
  const { generate, cancel, isRunning } = useLayoutPipeline()

  function handleSave() {
    const ok = save()
    if (ok) {
      toast.success("บันทึกแล้ว")
    } else {
      toast.error("บันทึกไม่สำเร็จ")
    }
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-30 flex h-12 items-center gap-2 border-b bg-background px-4">
      <Link
        href="/projects"
        className="flex items-center gap-2 text-sm font-bold"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
          <span className="text-xs font-bold text-primary-foreground">B</span>
        </div>
      </Link>

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
        <TooltipContent>Undo</TooltipContent>
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
        <TooltipContent>Redo</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {tools.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <Toggle
              size="sm"
              pressed={activeTool === tool.id}
              onPressedChange={() => setActiveTool(tool.id)}
              className="h-8 w-8 p-0"
            >
              <tool.icon className="h-4 w-4" />
            </Toggle>
          </TooltipTrigger>
          <TooltipContent>{tool.label}</TooltipContent>
        </Tooltip>
      ))}

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            size="sm"
            pressed={viewMode === "2d"}
            onPressedChange={() =>
              setViewMode(viewMode === "3d" ? "2d" : "3d")
            }
            className="h-8 gap-1 px-2"
          >
            {viewMode === "3d" ? (
              <Box className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="text-xs">{viewMode.toUpperCase()}</span>
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Toggle View Mode</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleRoomSettings}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>ตั้งค่าห้อง</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            className="h-8 gap-1.5"
            variant={isRunning ? "destructive" : "default"}
            onClick={() => {
              if (isRunning) {
                cancel()
                toast.info("ยกเลิกการสร้าง Layout")
              } else {
                generate()
              }
            }}
          >
            {isRunning ? (
              <>
                <Square className="h-3.5 w-3.5" />
                <span className="text-xs">หยุด</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs">สร้าง Layout</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isRunning ? "หยุดสร้าง Layout" : "สร้าง Layout อัตโนมัติด้วย AI"}
        </TooltipContent>
      </Tooltip>

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            <span className="text-xs">Save</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save Project</TooltipContent>
      </Tooltip>
    </div>
  )
}

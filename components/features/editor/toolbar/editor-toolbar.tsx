"use client"

import Link from "next/link"
import { Save, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useUIStore } from "@/stores/ui-store"
import { useProject } from "@/hooks/use-project"
import { useUndoRedo } from "@/hooks/use-undo-redo"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { toast } from "sonner"

interface EditorToolbarProps {
  projectId: string
}

export function EditorToolbar({ projectId }: EditorToolbarProps) {
  const toggleRoomSettings = useUIStore((s) => s.toggleRoomSettingsPanel)

  const { save } = useProject(projectId)
  const { undo, redo } = useUndoRedo()
  // Keep keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z) even without toolbar buttons.
  useKeyboardShortcuts({ onUndo: undo, onRedo: redo })

  function handleSave() {
    const ok = save()
    if (ok) {
      toast.success("บันทึกแล้ว")
    } else {
      toast.error("บันทึกไม่สำเร็จ")
    }
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-30 flex h-10 items-center gap-1 border-b bg-background px-2 lg:h-12 lg:gap-2 lg:px-4">
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
            onClick={toggleRoomSettings}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>ตั้งค่าห้อง</TooltipContent>
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
            <span className="hidden text-xs lg:inline">บันทึก</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>บันทึกโปรเจค</TooltipContent>
      </Tooltip>
    </div>
  )
}

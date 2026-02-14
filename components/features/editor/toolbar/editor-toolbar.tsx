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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useEditorStore } from "@/stores/editor-store"
import type { ActiveTool } from "@/types/editor"

const tools: { id: ActiveTool; icon: typeof MousePointer2; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "move", icon: Move, label: "Move" },
  { id: "rotate", icon: RotateCcw, label: "Rotate" },
  { id: "delete", icon: Trash2, label: "Delete" },
]

export function EditorToolbar() {
  const activeTool = useEditorStore((s) => s.activeTool)
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const viewMode = useEditorStore((s) => s.viewMode)
  const setViewMode = useEditorStore((s) => s.setViewMode)

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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
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

      <div className="flex-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Save className="h-4 w-4" />
            <span className="text-xs">Save</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save Project</TooltipContent>
      </Tooltip>
    </div>
  )
}

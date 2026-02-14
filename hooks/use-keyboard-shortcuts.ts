"use client"

import { useEffect } from "react"
import { useEditorStore } from "@/stores/editor-store"

interface UseKeyboardShortcutsOptions {
  onUndo?: () => void
  onRedo?: () => void
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
}: UseKeyboardShortcutsOptions = {}) {
  const setActiveTool = useEditorStore((s) => s.setActiveTool)
  const selectedId = useEditorStore((s) => s.selectedId)
  const removeFurniture = useEditorStore((s) => s.removeFurniture)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in input fields
      const tag = (e.target as HTMLElement).tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      const ctrl = e.ctrlKey || e.metaKey

      // Ctrl+Z = undo
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        onUndo?.()
        return
      }

      // Ctrl+Shift+Z or Ctrl+Y = redo
      if ((ctrl && e.key === "z" && e.shiftKey) || (ctrl && e.key === "y")) {
        e.preventDefault()
        onRedo?.()
        return
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select")
          break
        case "g":
          setActiveTool("move")
          break
        case "r":
          setActiveTool("rotate")
          break
        case "delete":
        case "backspace":
          if (selectedId) {
            removeFurniture(selectedId)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [setActiveTool, selectedId, removeFurniture, onUndo, onRedo])
}

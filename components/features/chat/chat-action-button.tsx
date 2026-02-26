"use client"

import { Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEditorStore } from "@/stores/editor-store"
import type { LayoutActionData } from "@/types/chat"

interface ChatActionButtonProps {
  action: LayoutActionData
}

export function ChatActionButton({ action }: ChatActionButtonProps) {
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)

  function handleApply() {
    if (action.type === "apply_layout") {
      const items = action.payload.map((item, i) => ({
        ...item,
        instanceId: `${item.id}-${Date.now()}-${i}`,
      }))
      setFurnitureItems(items)
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="mt-1 h-7 gap-1.5 border-primary text-xs text-primary hover:bg-primary hover:text-primary-foreground"
      onClick={handleApply}
    >
      <Wand2 className="h-3 w-3" />
      นำไปใช้บน Canvas
    </Button>
  )
}

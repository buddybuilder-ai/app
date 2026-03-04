"use client"

import { useEffect } from "react"
import { Sofa, SlidersHorizontal, Compass, Settings2, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/stores/ui-store"
import type { BottomSheet } from "@/stores/ui-store"
import { useEditorStore } from "@/stores/editor-store"

const NAV_ITEMS: { id: BottomSheet; icon: typeof Sofa; label: string }[] = [
  { id: "furniture", icon: Sofa, label: "เฟอร์นิเจอร์" },
  { id: "properties", icon: SlidersHorizontal, label: "คุณสมบัติ" },
  { id: "feng-shui", icon: Compass, label: "ฮ้วงจุ้ย" },
  { id: "settings", icon: Settings2, label: "ห้อง" },
  { id: "chat", icon: MessageCircle, label: "แชท" },
]

export function MobileBottomNav() {
  const activeSheet = useUIStore((s) => s.activeBottomSheet)
  const setActiveSheet = useUIStore((s) => s.setActiveBottomSheet)
  const selectedId = useEditorStore((s) => s.selectedId)

  // Auto-open properties sheet when user selects a furniture item
  useEffect(() => {
    if (selectedId) {
      setActiveSheet("properties")
    }
  }, [selectedId, setActiveSheet])

  function handleTap(id: BottomSheet) {
    // properties tab only shown when furniture is selected
    if (id === "properties" && !selectedId) return
    setActiveSheet(activeSheet === id ? null : id)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around border-t bg-background">
      {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
        const isActive = activeSheet === id
        const isDisabled = id === "properties" && !selectedId
        return (
          <button
            key={id}
            onClick={() => handleTap(id)}
            disabled={isDisabled}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground",
              isDisabled && "opacity-30"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] leading-none">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/chat-store"

interface ChatSuggestionsProps {
  onSelect: (text: string) => void
}

const SUGGESTIONS = [
  "จัดห้อง Studio ขนาด 6x4 เมตร",
  "วิเคราะห์ฮวงจุ้ยห้องนอน",
  "แนะนำเฟอร์นิเจอร์สำหรับห้องเล็ก",
  "ปรับปรุงผัง Chi Flow",
]

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  const messages = useChatStore((s) => s.messages)

  // Only show when no messages yet
  if (messages.length > 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className={cn(
            "rounded-full border border-border bg-background px-3 py-1.5",
            "text-xs text-muted-foreground transition-colors",
            "hover:border-primary/50 hover:text-foreground"
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

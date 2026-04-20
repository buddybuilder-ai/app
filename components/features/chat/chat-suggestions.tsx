"use client"

import { cn } from "@/lib/utils"
import { useChatStore } from "@/stores/chat-store"

interface ChatSuggestionsProps {
  onSelect: (text: string) => void
}

const SUGGESTIONS = [
  "จัดห้องใหม่ให้ถูกหลักฮวงจุ้ย",
  "ย้ายเตียงไปตำแหน่งผู้บัญชาการ",
  "จัดวางโซฟาให้หันหน้าเข้าประตู",
]

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  const messages = useChatStore((s) => s.messages)

  if (messages.length > 0) return null

  return (
    <div className="flex flex-col gap-1.5 px-3 pb-2">
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className={cn(
            "rounded-full border border-border bg-background px-3 py-1.5",
            "text-left text-xs text-muted-foreground transition-colors",
            "hover:border-primary/50 hover:text-foreground"
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}

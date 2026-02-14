"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChatStore } from "@/stores/chat-store"

export function ChatBubbleTrigger() {
  const toggleOpen = useChatStore((s) => s.toggleOpen)
  const messages = useChatStore((s) => s.messages)

  const unread = messages.filter((m) => m.role === "assistant").length

  return (
    <Button
      size="icon"
      className="h-14 w-14 rounded-full shadow-lg"
      onClick={toggleOpen}
    >
      <MessageCircle className="h-6 w-6" />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Button>
  )
}

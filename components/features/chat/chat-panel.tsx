"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useChatStore } from "@/stores/chat-store"
import { ChatModeSelector } from "./chat-mode-selector"
import { ChatMessageList } from "./chat-message-list"
import { ChatInput } from "./chat-input"

export function ChatPanel() {
  const setOpen = useChatStore((s) => s.setOpen)

  return (
    <Card className="flex h-[520px] w-[420px] flex-col overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary px-4 py-2.5">
        <h3 className="text-sm font-semibold text-primary-foreground">
          AI Assistant
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Mode selector */}
      <div className="border-b px-3 py-2">
        <ChatModeSelector />
      </div>

      {/* Messages */}
      <ChatMessageList />

      {/* Input */}
      <ChatInput />
    </Card>
  )
}

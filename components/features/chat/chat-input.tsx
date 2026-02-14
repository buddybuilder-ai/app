"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useChatStore } from "@/stores/chat-store"

export function ChatInput() {
  const [text, setText] = useState("")
  const addMessage = useChatStore((s) => s.addMessage)
  const mode = useChatStore((s) => s.mode)
  const isLoading = useChatStore((s) => s.isLoading)

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      mode,
      timestamp: new Date(),
    })

    setText("")
    // API call will be connected in Phase 8
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t p-3">
      <div className="flex gap-2">
        <Textarea
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="min-h-[36px] max-h-[100px] resize-none text-sm"
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

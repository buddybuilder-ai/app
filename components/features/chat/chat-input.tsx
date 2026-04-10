"use client"

import { useState } from "react"
import { ArrowUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useChatStore } from "@/stores/chat-store"
import { useChat } from "@/hooks/use-chat"
import { ChatSuggestions } from "./chat-suggestions"
import { cn } from "@/lib/utils"
import type { ChatMode } from "@/types/chat"

const MODES: { value: ChatMode; label: string; description: string }[] = [
  { value: "mentor", label: "ที่ปรึกษา", description: "คำแนะนำเชิงลึก" },
  { value: "buddy", label: "เพื่อน", description: "เป็นกันเอง" },
  { value: "fun", label: "สนุก", description: "สนุกสนาน" },
]

export function ChatInput() {
  const [text, setText] = useState("")
  const [modeOpen, setModeOpen] = useState(false)
  const addMessage = useChatStore((s) => s.addMessage)
  const mode = useChatStore((s) => s.mode)
  const setMode = useChatStore((s) => s.setMode)
  const isLoading = useChatStore((s) => s.isLoading)
  const { send } = useChat()

  const currentMode = MODES.find((m) => m.value === mode)!

  function handleSend(content?: string) {
    const trimmed = (content ?? text).trim()
    if (!trimmed || isLoading) return

    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      mode,
      timestamp: new Date(),
    })

    setText("")
    send(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSuggestion(suggestion: string) {
    handleSend(suggestion)
  }

  return (
    <div className="border-t">
      {/* Suggestions */}
      <ChatSuggestions onSelect={handleSuggestion} />

      {/* Input area — Colab style */}
      <div className="p-3 pt-1">
        <div className="rounded-xl border border-border bg-muted/50 transition-colors focus-within:border-primary/50">
          {/* Textarea */}
          <Textarea
            placeholder="ให้ช่วยออกแบบอะไรดี?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="min-h-[40px] max-h-[100px] resize-none border-0 bg-transparent px-4 pt-3 pb-0 text-sm shadow-none focus-visible:ring-0"
          />

          {/* Bottom bar: mode selector + send */}
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            {/* Mode dropdown (left) */}
            <Popover open={modeOpen} onOpenChange={setModeOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs",
                    "text-muted-foreground transition-colors",
                    "hover:bg-muted hover:text-foreground"
                  )}
                >
                  {currentMode.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-44 p-1"
                sideOffset={8}
              >
                {MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => {
                      setMode(m.value)
                      setModeOpen(false)
                    }}
                    className={cn(
                      "flex w-full flex-col items-start rounded-md px-3 py-2 text-left transition-colors",
                      "hover:bg-muted",
                      mode === m.value && "bg-muted"
                    )}
                  >
                    <span className="text-xs font-medium">{m.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {m.description}
                    </span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Send button (right) */}
            <Button
              size="icon"
              variant={text.trim() ? "default" : "ghost"}
              className="h-7 w-7 shrink-0 rounded-lg"
              onClick={() => handleSend()}
              disabled={!text.trim() || isLoading}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Bot, ArrowUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container"
import { useChatStore } from "@/stores/chat-store"
import { useRagChat } from "@/hooks/use-rag-chat"
import { ChatMessage } from "./chat-message"
import { cn } from "@/lib/utils"
import type { ChatMode } from "@/types/chat"

const MODES: { value: ChatMode; label: string; description: string }[] = [
  { value: "mentor", label: "Mentor", description: "คำแนะนำเชิงลึก" },
  { value: "buddy", label: "Buddy", description: "เป็นกันเอง" },
  { value: "fun", label: "Fun", description: "สนุกสนาน" },
]

const RAG_SUGGESTIONS = [
  "ทิศหัวนอนไหนดีที่สุดตามฮวงจุ้ย?",
  "สีห้องนอนที่ช่วยเรื่องความรักมีอะไรบ้าง?",
  "วางเตียงให้ถูกหลักฮวงจุ้ยยังไง?",
  "ห้องนอนคอนโดเล็กควรจัดยังไง?",
]

export function ChatFullPage() {
  const [text, setText] = useState("")
  const [modeOpen, setModeOpen] = useState(false)

  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const mode = useChatStore((s) => s.mode)
  const setMode = useChatStore((s) => s.setMode)
  const addMessage = useChatStore((s) => s.addMessage)

  const { send } = useRagChat()
  const currentMode = MODES.find((m) => m.value === mode)!

  function handleSend(content?: string) {
    const trimmed = (content ?? text).trim()
    if (!trimmed || isLoading) return
    addMessage({
      id: `user-${crypto.randomUUID()}`,
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

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Messages */}
      <ChatContainerRoot className="flex-1">
        <ChatContainerContent className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 md:px-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-6 py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="text-base font-semibold">สวัสดีครับ!</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  ถามเรื่องฮวงจุ้ยห้องนอน การจัดวางเตียง หรือการออกแบบได้เลยครับ
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {RAG_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSend(s)}
                    className={cn(
                      "rounded-full border border-border bg-background px-4 py-1.5",
                      "text-xs text-muted-foreground transition-colors",
                      "hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex items-start gap-2 px-0 md:px-6">
              <div className="flex items-center gap-2 px-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-lg px-2 py-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <ChatContainerScrollAnchor />
        </ChatContainerContent>
      </ChatContainerRoot>

      {/* Input */}
      <div className="border-t px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-xl border border-border bg-muted/50 transition-colors focus-within:border-primary/50">
            <Textarea
              placeholder="ถามเรื่องฮวงจุ้ยห้องนอนได้เลยครับ..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="min-h-11 max-h-30 resize-none border-0 bg-transparent px-4 pt-3 pb-0 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between px-2 pb-2 pt-1">
              <Popover open={modeOpen} onOpenChange={setModeOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {currentMode.label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-44 p-1" sideOffset={8}>
                  {MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => { setMode(m.value); setModeOpen(false) }}
                      className={cn(
                        "flex w-full flex-col items-start rounded-md px-3 py-2 text-left transition-colors hover:bg-muted",
                        mode === m.value && "bg-muted"
                      )}
                    >
                      <span className="text-xs font-medium">{m.label}</span>
                      <span className="text-[10px] text-muted-foreground">{m.description}</span>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

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
          <p className="mt-2 text-center text-[10px] text-muted-foreground/60">
            Buddy Builder AI เชี่ยวชาญเฉพาะฮวงจุ้ยและการออกแบบห้องนอน
          </p>
        </div>
      </div>
    </div>
  )
}

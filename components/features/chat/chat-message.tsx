"use client"

import { useState } from "react"
import { Bot, User, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatMessage as ChatMessageType } from "@/types/chat"
import { ChatActionButton } from "./chat-action-button"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const isUser = message.role === "user"

  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "max-w-[85%] space-y-1.5",
          isUser && "text-right"
        )}
      >
        <div
          className={cn(
            "inline-block rounded-lg px-3 py-2 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Layout action button */}
        {message.layoutAction && (
          <ChatActionButton action={message.layoutAction} />
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="text-left">
            <button
              type="button"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setSourcesOpen(!sourcesOpen)}
            >
              {sourcesOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {message.sources.length} source{message.sources.length > 1 ? "s" : ""}
            </button>
            {sourcesOpen && (
              <div className="mt-1 space-y-1">
                {message.sources.map((source, i) => (
                  <div
                    key={i}
                    className="rounded border bg-background p-2 text-xs text-muted-foreground"
                  >
                    {source.content.slice(0, 200)}
                    {source.content.length > 200 && "..."}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { Bot } from "lucide-react"
import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container"
import { useChatStore } from "@/stores/chat-store"
import { useChat } from "@/hooks/use-chat"
import { ChatMessage } from "./chat-message"

export function ChatMessageList() {
  const messages = useChatStore((s) => s.messages)
  const isLoading = useChatStore((s) => s.isLoading)
  const { submitClarification } = useChat()

  return (
    <ChatContainerRoot className="flex-1">
      <ChatContainerContent className="space-y-6 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              ถามเรื่องการออกแบบภายใน ฮวงจุ้ย หรือการจัดวางเฟอร์นิเจอร์ได้เลย!
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onSubmitClarification={submitClarification}
          />
        ))}

        {isLoading && (
          <div className="mx-auto flex w-full max-w-3xl items-start gap-2 px-0 md:px-6">
            <div className="flex items-center gap-2 px-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="rounded-lg bg-transparent px-2 py-2">
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
  )
}

"use client"

import { History, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useChatStore } from "@/stores/chat-store"
import { useConversations } from "@/hooks/use-conversations"
import { ChatMessageList } from "./chat-message-list"
import { ChatInput } from "./chat-input"
import { ChatHistory } from "./chat-history"

export function ChatPanel() {
  const setOpen = useChatStore((s) => s.setOpen)
  const showHistory = useChatStore((s) => s.showHistory)
  const setShowHistory = useChatStore((s) => s.setShowHistory)
  const { conversations, newConversation } = useConversations()

  return (
    <Card className="flex h-[560px] w-[460px] flex-col overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setShowHistory(!showHistory)}
            title="ประวัติแชท"
          >
            <History className="h-4 w-4" />
          </Button>
          {conversations.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={newConversation}
              title="แชทใหม่"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          BuddyBuilder AI
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {showHistory ? (
        <ChatHistory />
      ) : (
        <>
          {/* Messages */}
          <ChatMessageList />

          {/* Input (includes mode selector + suggestions) */}
          <ChatInput />
        </>
      )}
    </Card>
  )
}

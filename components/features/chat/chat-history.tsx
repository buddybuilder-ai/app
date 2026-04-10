"use client"

import { ArrowLeft, MessageSquare, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/stores/chat-store"
import { useConversations } from "@/hooks/use-conversations"
import { cn } from "@/lib/utils"

export function ChatHistory() {
  const setShowHistory = useChatStore((s) => s.setShowHistory)
  const { conversations, conversationId, switchConversation, newConversation, deleteConversation } =
    useConversations()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setShowHistory(false)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium">ประวัติแชท</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={async () => {
            await newConversation()
            setShowHistory(false)
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">ยังไม่มีประวัติการสนทนา</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conv) => {
              const isActive = conv.id === conversationId
              const timeStr = formatRelativeTime(new Date(conv.created_at))

              return (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                    isActive && "bg-muted"
                  )}
                  onClick={() => {
                    switchConversation(conv.id)
                    setShowHistory(false)
                  }}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{conv.title}</p>
                    <p className="text-[10px] text-muted-foreground">{timeStr}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conv.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "เมื่อสักครู่"
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  return `${days} วันที่แล้ว`
}

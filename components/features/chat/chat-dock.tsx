"use client"

import { MessageCircle, PanelRightClose } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatStore } from "@/stores/chat-store"
import { ChatMessageList } from "./chat-message-list"
import { ChatInput } from "./chat-input"

export function ChatDock() {
  const isOpen = useChatStore((s) => s.isOpen)
  const setOpen = useChatStore((s) => s.setOpen)

  if (!isOpen) {
    return (
      <div className="flex h-full w-12 shrink-0 flex-col items-center border-l bg-background pt-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">เปิดแชท AI</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="flex h-full w-96 shrink-0 flex-col border-l bg-background shadow-lg">
      <div className="flex items-center justify-between border-b px-4 py-2.5">
        <h3 className="text-sm font-semibold">BuddyBuilder AI</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">ยุบแชท</TooltipContent>
        </Tooltip>
      </div>
      <ChatMessageList />
      <ChatInput />
    </div>
  )
}

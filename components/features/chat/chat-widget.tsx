"use client"

import { useChatStore } from "@/stores/chat-store"
import { ChatBubbleTrigger } from "./chat-bubble-trigger"
import { ChatPanel } from "./chat-panel"

export function ChatWidget() {
  const isOpen = useChatStore((s) => s.isOpen)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-6">
      <div className="pointer-events-auto">
        {isOpen ? <ChatPanel /> : <ChatBubbleTrigger />}
      </div>
    </div>
  )
}

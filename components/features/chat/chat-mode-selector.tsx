"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChatStore } from "@/stores/chat-store"
import type { ChatMode } from "@/types/chat"

const MODES: { value: ChatMode; label: string }[] = [
  { value: "mentor", label: "Mentor" },
  { value: "buddy", label: "Buddy" },
  { value: "fun", label: "Fun" },
]

export function ChatModeSelector() {
  const mode = useChatStore((s) => s.mode)
  const setMode = useChatStore((s) => s.setMode)

  return (
    <Tabs
      value={mode}
      onValueChange={(v) => setMode(v as ChatMode)}
    >
      <TabsList className="h-7">
        {MODES.map((m) => (
          <TabsTrigger
            key={m.value}
            value={m.value}
            className="px-2.5 text-xs"
          >
            {m.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

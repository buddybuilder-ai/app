import { create } from "zustand"
import type { ChatMessage, ChatMode } from "@/types/chat"

interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  mode: ChatMode

  toggleOpen: () => void
  setOpen: (open: boolean) => void
  setMode: (mode: ChatMode) => void
  addMessage: (message: ChatMessage) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  mode: "buddy",

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setMode: (mode) => set({ mode }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),
}))

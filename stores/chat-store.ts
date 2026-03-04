import { create } from "zustand"
import type { ChatMessage, ChatMode } from "@/types/chat"
import type { ClarificationQuestion } from "@/types/pipeline"

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface PendingClarification {
  messageId: string
  originalMessage: string
  questions: ClarificationQuestion[]
  answers: Record<string, string>
}

interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  mode: ChatMode

  // Chat history
  sessions: ChatSession[]
  activeSessionId: string | null
  showHistory: boolean

  // Pending clarification (set when backend asks questions before pipeline)
  pendingClarification: PendingClarification | null

  toggleOpen: () => void
  setOpen: (open: boolean) => void
  setMode: (mode: ChatMode) => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void

  // History actions
  setShowHistory: (show: boolean) => void
  newSession: () => void
  switchSession: (sessionId: string) => void
  deleteSession: (sessionId: string) => void

  // Clarification actions
  setPendingClarification: (data: PendingClarification | null) => void
}

function generateSessionTitle(messages: ChatMessage[]): string {
  const firstUserMsg = messages.find((m) => m.role === "user")
  if (!firstUserMsg) return "แชทใหม่"
  const title = firstUserMsg.content.slice(0, 40)
  return firstUserMsg.content.length > 40 ? `${title}...` : title
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  mode: "buddy",

  sessions: [],
  activeSessionId: null,
  showHistory: false,

  pendingClarification: null,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  setMode: (mode) => set({ mode }),
  addMessage: (message) =>
    set((state) => {
      const newMessages = [...state.messages, message]

      // Auto-save to active session
      if (state.activeSessionId) {
        const sessions = state.sessions.map((s) =>
          s.id === state.activeSessionId
            ? {
                ...s,
                messages: newMessages,
                title: generateSessionTitle(newMessages),
                updatedAt: new Date(),
              }
            : s
        )
        return { messages: newMessages, sessions }
      }

      // Auto-create session on first message
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: generateSessionTitle(newMessages),
        messages: newMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      return {
        messages: newMessages,
        sessions: [newSession, ...state.sessions],
        activeSessionId: newSession.id,
      }
    }),
  updateMessage: (id, updates) =>
    set((state) => {
      const newMessages = state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      )

      // Sync to active session
      if (state.activeSessionId) {
        const sessions = state.sessions.map((s) =>
          s.id === state.activeSessionId
            ? { ...s, messages: newMessages, updatedAt: new Date() }
            : s
        )
        return { messages: newMessages, sessions }
      }

      return { messages: newMessages }
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] }),

  setShowHistory: (show) => set({ showHistory: show }),

  newSession: () =>
    set({
      messages: [],
      activeSessionId: null,
      showHistory: false,
    }),

  switchSession: (sessionId) => {
    const session = get().sessions.find((s) => s.id === sessionId)
    if (session) {
      set({
        messages: session.messages,
        activeSessionId: sessionId,
        showHistory: false,
      })
    }
  },

  deleteSession: (sessionId) =>
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== sessionId)
      const isActive = state.activeSessionId === sessionId
      return {
        sessions,
        ...(isActive ? { messages: [], activeSessionId: null } : {}),
      }
    }),

  setPendingClarification: (data) => set({ pendingClarification: data }),
}))

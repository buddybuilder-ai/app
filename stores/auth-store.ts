import { create } from "zustand"

interface User {
  id: string
  email: string
  display_name: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),

  fetchMe: async () => {
    set({ isLoading: true })
    try {
      const resp = await fetch("/api/auth/me")
      if (resp.ok) {
        const user: User = await resp.json()
        set({ user })
      } else {
        set({ user: null })
      }
    } catch {
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    set({ user: null })
    window.location.href = "/login"
  },
}))

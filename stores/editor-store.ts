import { create } from "zustand"
import { useChatStore } from "@/stores/chat-store"

let saveTimer: ReturnType<typeof setTimeout> | null = null

function autoSaveLayout(items: import("@/types/editor").FurnitureInstance[]) {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const projectId = useChatStore.getState().projectId
    if (!projectId) return
    fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latest_layout: items }),
    }).catch(() => {/* silent */})
  }, 1000) // debounce 1s
}
import type {
  RoomConfig,
  FurnitureInstance,
  ActiveTool,
  ViewMode,
  FengShuiScoreBreakdown,
} from "@/types/editor"

interface EditorState {
  room: RoomConfig
  setRoom: (room: RoomConfig) => void

  furnitureItems: FurnitureInstance[]
  addFurniture: (item: FurnitureInstance) => void
  removeFurniture: (id: string) => void
  updateFurniture: (
    id: string,
    updates: Partial<FurnitureInstance>
  ) => void
  setFurnitureItems: (items: FurnitureInstance[]) => void

  selectedId: string | null
  setSelectedId: (id: string | null) => void

  activeTool: ActiveTool
  setActiveTool: (tool: ActiveTool) => void

  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  fengShuiScore: FengShuiScoreBreakdown | null
  setFengShuiScore: (score: FengShuiScoreBreakdown | null) => void

  isGizmoDragging: boolean
  setIsGizmoDragging: (dragging: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  room: {
    width: 6,
    depth: 4,
    height: 2.8,
    room_type: "studio_apartment",
    doors: [{ wall: "south", offset: 1.0, width: 0.9, swing_inward: true }],
    windows: [
      {
        wall: "north",
        offset: 2.0,
        width: 1.5,
        height: 1.2,
        sill_height: 0.9,
      },
    ],
    direction: "north",
    zones: [],
    user_preferences: {},
  },
  setRoom: (room) => set({ room }),

  furnitureItems: [],
  addFurniture: (item) =>
    set((state) => ({ furnitureItems: [...state.furnitureItems, item] })),
  removeFurniture: (id) =>
    set((state) => {
      const furnitureItems = state.furnitureItems.filter((f) => f.instanceId !== id)
      autoSaveLayout(furnitureItems)
      return { furnitureItems, selectedId: state.selectedId === id ? null : state.selectedId }
    }),
  updateFurniture: (id, updates) =>
    set((state) => {
      const furnitureItems = state.furnitureItems.map((f) =>
        f.instanceId === id ? { ...f, ...updates } : f
      )
      autoSaveLayout(furnitureItems)
      return { furnitureItems }
    }),
  setFurnitureItems: (items) => set({ furnitureItems: items }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),

  viewMode: "3d",
  setViewMode: (mode) => set({ viewMode: mode }),

  fengShuiScore: null,
  setFengShuiScore: (score) => set({ fengShuiScore: score }),

  isGizmoDragging: false,
  setIsGizmoDragging: (dragging) => set({ isGizmoDragging: dragging }),
}))

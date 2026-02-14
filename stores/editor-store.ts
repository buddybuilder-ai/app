import { create } from "zustand"
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
}

export const useEditorStore = create<EditorState>((set) => ({
  room: {
    width: 5,
    depth: 4,
    height: 2.8,
    room_type: "bedroom",
    doors: [],
    windows: [],
    direction: "north",
  },
  setRoom: (room) => set({ room }),

  furnitureItems: [],
  addFurniture: (item) =>
    set((state) => ({ furnitureItems: [...state.furnitureItems, item] })),
  removeFurniture: (id) =>
    set((state) => ({
      furnitureItems: state.furnitureItems.filter((f) => f.instanceId !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),
  updateFurniture: (id, updates) =>
    set((state) => ({
      furnitureItems: state.furnitureItems.map((f) =>
        f.instanceId === id ? { ...f, ...updates } : f
      ),
    })),
  setFurnitureItems: (items) => set({ furnitureItems: items }),

  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),

  activeTool: "select",
  setActiveTool: (tool) => set({ activeTool: tool }),

  viewMode: "3d",
  setViewMode: (mode) => set({ viewMode: mode }),

  fengShuiScore: null,
  setFengShuiScore: (score) => set({ fengShuiScore: score }),
}))

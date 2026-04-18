import { create } from "zustand"
import { useChatStore } from "@/stores/chat-store"

let saveTimer: ReturnType<typeof setTimeout> | null = null

function autoSaveLayout(items: import("@/types/editor").FurnitureInstance[]) {
  if (saveTimer) clearTimeout(saveTimer)
  // Mark dirty immediately; flush after debounce
  useEditorStore.setState({ saveStatus: "dirty" })
  saveTimer = setTimeout(async () => {
    const projectId = useChatStore.getState().projectId
    if (!projectId) return
    useEditorStore.setState({ saveStatus: "saving" })
    try {
      const resp = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latest_layout: items }),
      })
      if (resp.ok) {
        useEditorStore.setState({ saveStatus: "saved", lastSavedAt: Date.now() })
      } else {
        useEditorStore.setState({ saveStatus: "error" })
      }
    } catch {
      useEditorStore.setState({ saveStatus: "error" })
    }
  }, 1000) // debounce 1s
}
import type {
  RoomConfig,
  FurnitureInstance,
  ActiveTool,
  ViewMode,
  FengShuiScoreBreakdown,
} from "@/types/editor"

const MAX_HISTORY = 50

function cloneItems(items: FurnitureInstance[]): FurnitureInstance[] {
  return items.map((item) => ({ ...item, dimensions: { ...item.dimensions } }))
}

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error"

interface EditorState {
  projectName: string | null
  setProjectName: (name: string | null) => void

  saveStatus: SaveStatus
  lastSavedAt: number | null
  setSaveStatus: (status: SaveStatus) => void

  room: RoomConfig
  setRoom: (room: RoomConfig) => void

  furnitureItems: FurnitureInstance[]
  addFurniture: (item: FurnitureInstance) => void
  removeFurniture: (id: string) => void
  updateFurniture: (
    id: string,
    updates: Partial<FurnitureInstance>,
    options?: { skipHistory?: boolean }
  ) => void
  setFurnitureItems: (items: FurnitureInstance[], options?: { skipHistory?: boolean }) => void
  beginTransaction: () => void

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

  past: FurnitureInstance[][]
  future: FurnitureInstance[][]
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useEditorStore = create<EditorState>((set, get) => ({
  projectName: null,
  setProjectName: (projectName) => set({ projectName }),

  saveStatus: "idle",
  lastSavedAt: null,
  setSaveStatus: (saveStatus) => set({ saveStatus }),

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
  past: [],
  future: [],

  addFurniture: (item) =>
    set((state) => ({
      past: [...state.past.slice(-MAX_HISTORY + 1), cloneItems(state.furnitureItems)],
      future: [],
      furnitureItems: [...state.furnitureItems, item],
    })),
  removeFurniture: (id) =>
    set((state) => {
      const furnitureItems = state.furnitureItems.filter((f) => f.instanceId !== id)
      autoSaveLayout(furnitureItems)
      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), cloneItems(state.furnitureItems)],
        future: [],
        furnitureItems,
        selectedId: state.selectedId === id ? null : state.selectedId,
      }
    }),
  updateFurniture: (id, updates, options) =>
    set((state) => {
      const furnitureItems = state.furnitureItems.map((f) =>
        f.instanceId === id ? { ...f, ...updates } : f
      )
      autoSaveLayout(furnitureItems)
      if (options?.skipHistory) {
        return { furnitureItems }
      }
      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), cloneItems(state.furnitureItems)],
        future: [],
        furnitureItems,
      }
    }),
  beginTransaction: () =>
    set((state) => ({
      past: [...state.past.slice(-MAX_HISTORY + 1), cloneItems(state.furnitureItems)],
      future: [],
    })),
  setFurnitureItems: (items, options) =>
    set((state) => {
      if (options?.skipHistory) return { furnitureItems: items }
      return {
        past: [...state.past.slice(-MAX_HISTORY + 1), cloneItems(state.furnitureItems)],
        future: [],
        furnitureItems: items,
      }
    }),

  undo: () => {
    const state = get()
    if (state.past.length === 0) return
    const previous = state.past[state.past.length - 1]
    const newPast = state.past.slice(0, -1)
    const current = cloneItems(state.furnitureItems)
    set({
      past: newPast,
      future: [...state.future, current],
      furnitureItems: previous,
      selectedId: previous.some((f) => f.instanceId === state.selectedId)
        ? state.selectedId
        : null,
    })
    autoSaveLayout(previous)
  },
  redo: () => {
    const state = get()
    if (state.future.length === 0) return
    const next = state.future[state.future.length - 1]
    const newFuture = state.future.slice(0, -1)
    const current = cloneItems(state.furnitureItems)
    set({
      past: [...state.past, current],
      future: newFuture,
      furnitureItems: next,
      selectedId: next.some((f) => f.instanceId === state.selectedId)
        ? state.selectedId
        : null,
    })
    autoSaveLayout(next)
  },
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

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

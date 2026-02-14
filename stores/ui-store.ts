import { create } from "zustand"

type Locale = "en" | "th"

interface UIState {
  furniturePanelOpen: boolean
  propertiesPanelOpen: boolean
  fengShuiPanelOpen: boolean
  locale: Locale

  toggleFurniturePanel: () => void
  togglePropertiesPanel: () => void
  toggleFengShuiPanel: () => void
  setLocale: (locale: Locale) => void
}

export const useUIStore = create<UIState>((set) => ({
  furniturePanelOpen: true,
  propertiesPanelOpen: false,
  fengShuiPanelOpen: false,
  locale: "th",

  toggleFurniturePanel: () =>
    set((state) => ({ furniturePanelOpen: !state.furniturePanelOpen })),
  togglePropertiesPanel: () =>
    set((state) => ({ propertiesPanelOpen: !state.propertiesPanelOpen })),
  toggleFengShuiPanel: () =>
    set((state) => ({ fengShuiPanelOpen: !state.fengShuiPanelOpen })),
  setLocale: (locale) => set({ locale }),
}))

import { create } from "zustand"

type Locale = "en" | "th"
export type BottomSheet = "furniture" | "properties" | "feng-shui" | "settings" | "chat"

interface UIState {
  furniturePanelOpen: boolean
  propertiesPanelOpen: boolean
  fengShuiPanelOpen: boolean
  roomSettingsPanelOpen: boolean
  locale: Locale
  activeBottomSheet: BottomSheet | null

  toggleFurniturePanel: () => void
  togglePropertiesPanel: () => void
  toggleFengShuiPanel: () => void
  toggleRoomSettingsPanel: () => void
  setLocale: (locale: Locale) => void
  setActiveBottomSheet: (sheet: BottomSheet | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  furniturePanelOpen: true,
  propertiesPanelOpen: false,
  fengShuiPanelOpen: false,
  roomSettingsPanelOpen: false,
  locale: "th",
  activeBottomSheet: null,

  toggleFurniturePanel: () =>
    set((state) => ({ furniturePanelOpen: !state.furniturePanelOpen })),
  togglePropertiesPanel: () =>
    set((state) => ({ propertiesPanelOpen: !state.propertiesPanelOpen })),
  toggleFengShuiPanel: () =>
    set((state) => ({
      fengShuiPanelOpen: !state.fengShuiPanelOpen,
      roomSettingsPanelOpen: state.fengShuiPanelOpen
        ? state.roomSettingsPanelOpen
        : false,
    })),
  toggleRoomSettingsPanel: () =>
    set((state) => ({
      roomSettingsPanelOpen: !state.roomSettingsPanelOpen,
      fengShuiPanelOpen: state.roomSettingsPanelOpen
        ? state.fengShuiPanelOpen
        : false,
    })),
  setLocale: (locale) => set({ locale }),
  setActiveBottomSheet: (sheet) => set({ activeBottomSheet: sheet }),
}))

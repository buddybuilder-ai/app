"use client"

import { Suspense, useEffect } from "react"
import { EditorToolbar } from "./toolbar/editor-toolbar"
import { SceneCanvas } from "./canvas/scene-canvas"
import { FurniturePanel } from "./panels/furniture-panel"
import { PropertiesPanel } from "./panels/properties-panel"
import { FengShuiPanel } from "./panels/feng-shui-panel"
import { RoomSettingsPanel } from "./panels/room-settings-panel"
import { ChatWidget } from "@/components/features/chat/chat-widget"
import { MobileBottomNav } from "./mobile-bottom-nav"
import { MobileBottomSheet } from "./mobile-bottom-sheet"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { useProject } from "@/hooks/use-project"
import { useChatStore } from "@/stores/chat-store"

interface EditorWorkspaceProps {
  projectId: string
}

export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const { load } = useProject(projectId)
  const setProjectId = useChatStore((s) => s.setProjectId)

  useEffect(() => {
    setProjectId(projectId)
    load()
    return () => setProjectId(null)
  }, [load, projectId, setProjectId])

  return (
    <div className="relative h-full w-full">
      <EditorToolbar projectId={projectId} />

      {/* Canvas area — top-10 on mobile (h-10 toolbar), top-12 on desktop (h-12) */}
      {/* bottom-14 on mobile (h-14 bottom nav), bottom-0 on desktop */}
      <div className="absolute inset-0 top-10 bottom-14 lg:top-12 lg:bottom-0">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-muted">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    กำลังโหลดโปรแกรมแก้ไข 3 มิติ...
                  </p>
                </div>
              </div>
            }
          >
            <SceneCanvas />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Side panels */}
      <FurniturePanel />
      <PropertiesPanel />

      {/* Right panels */}
      <FengShuiPanel />
      <RoomSettingsPanel />

      {/* Chat — desktop floating widget */}
      <ChatWidget />

      {/* Mobile-only: bottom nav + bottom sheet */}
      <div className="lg:hidden">
        <MobileBottomNav />
        <MobileBottomSheet />
      </div>
    </div>
  )
}

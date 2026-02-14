"use client"

import { Suspense } from "react"
import { EditorToolbar } from "./toolbar/editor-toolbar"
import { SceneCanvas } from "./canvas/scene-canvas"
import { FurniturePanel } from "./panels/furniture-panel"
import { PropertiesPanel } from "./panels/properties-panel"
import { FengShuiPanel } from "./panels/feng-shui-panel"
import { ChatWidget } from "@/components/features/chat/chat-widget"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { LoadingSpinner } from "@/components/shared/loading-spinner"

interface EditorWorkspaceProps {
  projectId: string
}

export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  return (
    <div className="relative h-full w-full">
      <EditorToolbar />

      {/* Canvas area - fills space below toolbar */}
      <div className="absolute inset-0 top-12">
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-muted">
                <div className="text-center">
                  <LoadingSpinner size="lg" className="mx-auto" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Loading 3D Editor...
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

      {/* Feng Shui */}
      <FengShuiPanel />

      {/* Chat */}
      <ChatWidget />
    </div>
  )
}

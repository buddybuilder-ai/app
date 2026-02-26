"use client"

import { Suspense, useEffect } from "react"
import { EditorToolbar } from "./toolbar/editor-toolbar"
import { SceneCanvas } from "./canvas/scene-canvas"
import { FurniturePanel } from "./panels/furniture-panel"
import { PropertiesPanel } from "./panels/properties-panel"
import { FengShuiPanel } from "./panels/feng-shui-panel"
import { RoomSettingsPanel } from "./panels/room-settings-panel"
import { ChatWidget } from "@/components/features/chat/chat-widget"
import { PipelinePanel } from "./panels/pipeline-panel"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { useProject } from "@/hooks/use-project"

interface EditorWorkspaceProps {
  projectId: string
}

export function EditorWorkspace({ projectId }: EditorWorkspaceProps) {
  const { load } = useProject(projectId)

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="relative h-full w-full">
      <EditorToolbar projectId={projectId} />

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

      {/* Right panels */}
      <FengShuiPanel />
      <RoomSettingsPanel />

      {/* Pipeline progress */}
      <PipelinePanel />

      {/* Chat */}
      <ChatWidget />
    </div>
  )
}

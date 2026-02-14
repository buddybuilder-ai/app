"use client"

import { Suspense } from "react"
import { EditorToolbar } from "./toolbar/editor-toolbar"
import { SceneCanvas } from "./canvas/scene-canvas"
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
      </div>

      {/* FurniturePanel will be added in Phase 6 */}
      {/* PropertiesPanel will be added in Phase 6 */}
      {/* ChatWidget will be added in Phase 7 */}
      {/* FengShuiPanel will be added in Phase 9 */}
    </div>
  )
}

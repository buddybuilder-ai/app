"use client"

import { useCallback, useRef } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { usePipelineStore } from "@/stores/pipeline-store"
import type {
  PipelineSSEEvent,
  PipelineStepId,
  ConflictData,
  RepairActionData,
  LayoutItem,
  PipelineCompletedData,
} from "@/types/pipeline"
import type { FengShuiLayoutRequest } from "@/types/layout-api"
import type { FurnitureInstance } from "@/types/editor"

/**
 * Hook for running the 5-step agentic layout pipeline via SSE.
 *
 * Connects to POST /api/layout/stream, processes SSE events,
 * and updates both pipeline store and editor store.
 */
export function useLayoutPipeline() {
  const abortRef = useRef<AbortController | null>(null)

  // Pipeline store actions
  const startPipeline = usePipelineStore((s) => s.startPipeline)
  const setStepStarted = usePipelineStore((s) => s.setStepStarted)
  const setStepProgress = usePipelineStore((s) => s.setStepProgress)
  const setStepCompleted = usePipelineStore((s) => s.setStepCompleted)
  const setStepFailed = usePipelineStore((s) => s.setStepFailed)
  const addConflict = usePipelineStore((s) => s.addConflict)
  const addRepairAction = usePipelineStore((s) => s.addRepairAction)
  const setLayoutItems = usePipelineStore((s) => s.setLayoutItems)
  const completePipeline = usePipelineStore((s) => s.completePipeline)
  const failPipeline = usePipelineStore((s) => s.failPipeline)

  // Editor store actions
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)
  const setFengShuiScore = useEditorStore((s) => s.setFengShuiScore)
  const room = useEditorStore((s) => s.room)

  const isRunning = usePipelineStore((s) => s.isRunning)

  const generate = useCallback(
    async (overrides?: Partial<FengShuiLayoutRequest>) => {
      if (isRunning) return

      // Build request
      const request: FengShuiLayoutRequest = {
        dimensions: { width: room.width, depth: room.depth },
        room_type: room.room_type,
        doors: room.doors,
        windows: room.windows,
        direction: room.direction,
        budget_level: "medium",
        ...overrides,
      }

      // Abort any existing connection
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch("/api/layout/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
          signal: controller.signal,
        })

        if (!response.ok) {
          const text = await response.text().catch(() => "Unknown error")
          throw new Error(`Pipeline request failed: ${text}`)
        }

        if (!response.body) {
          throw new Error("No response body for SSE stream")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Parse SSE events from buffer
          const lines = buffer.split("\n")
          buffer = lines.pop() || "" // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6)) as PipelineSSEEvent
                handleEvent(event)
              } catch {
                // Skip malformed events
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const message = err instanceof Error ? err.message : "Pipeline failed"
        failPipeline(message)
      }
    },
    [room, isRunning]
  )

  function handleEvent(event: PipelineSSEEvent) {
    switch (event.type) {
      case "pipeline_started":
        startPipeline(event.pipeline_id as string)
        break

      case "step_started":
        setStepStarted(event.step as PipelineStepId)
        break

      case "step_progress":
        setStepProgress(
          event.step as PipelineStepId,
          event.message as string,
          event.progress as number
        )
        break

      case "step_completed":
        setStepCompleted(
          event.step as PipelineStepId,
          event as Record<string, unknown>
        )
        break

      case "step_failed":
        setStepFailed(event.step as PipelineStepId, event.error as string)
        break

      case "conflict_found":
        addConflict(event as unknown as ConflictData)
        break

      case "repair_applied":
        addRepairAction(event as unknown as RepairActionData)
        break

      case "layout_updated": {
        const items = event.items as LayoutItem[]
        setLayoutItems(items)
        // Progressive render: update editor canvas
        const furnitureItems: FurnitureInstance[] = items.map((item, i) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          pos_x: item.pos_x,
          pos_y: item.pos_y,
          pos_z: item.pos_z,
          rotation: item.rotation,
          dimensions: item.dimensions,
          is_essential: item.is_essential,
          feng_shui_notes: item.feng_shui_notes,
          instanceId: `${item.id}-${Date.now()}-${i}`,
        }))
        setFurnitureItems(furnitureItems)
        break
      }

      case "pipeline_completed": {
        const data = event as unknown as PipelineCompletedData
        completePipeline(data)
        // Update editor feng shui score
        if (data.feng_shui_score) {
          setFengShuiScore(data.feng_shui_score)
        }
        break
      }

      case "pipeline_failed":
        failPipeline(event.error as string)
        break
    }
  }

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    usePipelineStore.getState().reset()
  }, [])

  return { generate, cancel, isRunning }
}

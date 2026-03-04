"use client"

import { useCallback, useRef } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { usePipelineStore } from "@/stores/pipeline-store"
import { useChatStore } from "@/stores/chat-store"
import { useUIStore } from "@/stores/ui-store"
import type {
  PipelineSSEEvent,
  PipelineStepId,
  ConflictData,
  RepairActionData,
  LayoutItem,
  PipelineCompletedData,
} from "@/types/pipeline"
import { PIPELINE_STEP_LABELS } from "@/types/pipeline"
import type { FengShuiLayoutRequest } from "@/types/layout-api"
import type { FurnitureInstance } from "@/types/editor"
import type { ReasoningStep } from "@/types/chat"

/**
 * Hook for running the 5-step agentic layout pipeline via SSE.
 *
 * Connects to POST /api/layout/stream, processes SSE events,
 * and updates both pipeline store and editor store.
 */
export function useLayoutPipeline() {
  const abortRef = useRef<AbortController | null>(null)
  // Stable ref to hold the in-progress chat message id
  const chatMsgIdRef = useRef<string | null>(null)

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

      // Create a chat message for pipeline progress and open chat
      const msgId = `pipeline-${Date.now()}`
      chatMsgIdRef.current = msgId
      useChatStore.getState().addMessage({
        id: msgId,
        role: "assistant",
        content: "",
        mode: "buddy",
        timestamp: new Date(),
        isThinking: true,
        reasoningSteps: [],
      })
      // Open chat: desktop widget + mobile bottom sheet
      useChatStore.getState().setOpen(true)
      useUIStore.getState().setActiveBottomSheet("chat")

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
        const msgId = chatMsgIdRef.current
        if (msgId) {
          useChatStore.getState().updateMessage(msgId, {
            isThinking: false,
            content: `เกิดข้อผิดพลาด: ${message}`,
          })
          chatMsgIdRef.current = null
        }
      }
    },
    [room, isRunning]
  )

  function getChatSteps(): ReasoningStep[] {
    const msgId = chatMsgIdRef.current
    if (!msgId) return []
    const msg = useChatStore.getState().messages.find((m) => m.id === msgId)
    return msg?.reasoningSteps ?? []
  }

  function handleEvent(event: PipelineSSEEvent) {
    const msgId = chatMsgIdRef.current

    switch (event.type) {
      case "pipeline_started":
        startPipeline(event.pipeline_id as string)
        break

      case "step_started": {
        const stepId = event.step as PipelineStepId
        setStepStarted(stepId)
        if (msgId) {
          const label = PIPELINE_STEP_LABELS[stepId] ?? stepId
          const prevSteps = getChatSteps()
          useChatStore.getState().updateMessage(msgId, {
            reasoningSteps: [...prevSteps, { label, content: "กำลังดำเนินการ..." }],
          })
        }
        break
      }

      case "step_progress": {
        const stepId = event.step as PipelineStepId
        const message = event.message as string
        setStepProgress(stepId, message, event.progress as number)
        if (msgId) {
          const prevSteps = getChatSteps()
          if (prevSteps.length > 0) {
            const updated = [...prevSteps]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: message,
            }
            useChatStore.getState().updateMessage(msgId, { reasoningSteps: updated })
          }
        }
        break
      }

      case "step_completed": {
        const stepId = event.step as PipelineStepId
        setStepCompleted(stepId, event as Record<string, unknown>)
        if (msgId) {
          const prevSteps = getChatSteps()
          if (prevSteps.length > 0) {
            const updated = [...prevSteps]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content.replace(
                "กำลังดำเนินการ...",
                "เสร็จสิ้น"
              ),
            }
            useChatStore.getState().updateMessage(msgId, { reasoningSteps: updated })
          }
        }
        break
      }

      case "step_failed":
        setStepFailed(event.step as PipelineStepId, event.error as string)
        if (msgId) {
          const prevSteps = getChatSteps()
          const updated = [...prevSteps]
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: `เกิดข้อผิดพลาด: ${event.error as string}`,
            }
          }
          useChatStore.getState().updateMessage(msgId, {
            reasoningSteps: updated,
            isThinking: false,
            content: "เกิดข้อผิดพลาดระหว่างสร้าง layout",
          })
        }
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
        // Preserve instanceId and model_url for items already in the scene
        const existingMap = new Map(
          useEditorStore.getState().furnitureItems.map((f) => [f.id, f])
        )
        const furnitureItems: FurnitureInstance[] = items.map((item, i) => {
          const prev = existingMap.get(item.id)
          return {
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
            instanceId: prev?.instanceId ?? `${item.id}-${Date.now()}-${i}`,
            model_url: item.model_url ?? prev?.model_url,
          }
        })
        setFurnitureItems(furnitureItems)
        break
      }

      case "pipeline_completed": {
        const data = event as unknown as PipelineCompletedData
        completePipeline(data)
        if (data.feng_shui_score) {
          setFengShuiScore(data.feng_shui_score)
        }
        // Finalise the chat message with explanation
        if (msgId) {
          useChatStore.getState().updateMessage(msgId, {
            isThinking: false,
            content: data.explanation ?? "จัดเฟอร์นิเจอร์ตามหลักฮ้วงจุ้ยเสร็จแล้ว",
          })
        }
        chatMsgIdRef.current = null
        break
      }

      case "pipeline_failed":
        failPipeline(event.error as string)
        if (msgId) {
          useChatStore.getState().updateMessage(msgId, {
            isThinking: false,
            content: `เกิดข้อผิดพลาด: ${event.error as string ?? "ไม่ทราบสาเหตุ"}`,
          })
        }
        chatMsgIdRef.current = null
        break
    }
  }

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    usePipelineStore.getState().reset()
    const msgId = chatMsgIdRef.current
    if (msgId) {
      useChatStore.getState().updateMessage(msgId, {
        isThinking: false,
        content: "หยุดการสร้าง layout",
      })
      chatMsgIdRef.current = null
    }
  }, [])

  return { generate, cancel, isRunning }
}

"use client"

import { useCallback, useRef } from "react"
import { useChatStore } from "@/stores/chat-store"
import { useEditorStore } from "@/stores/editor-store"
import { usePipelineStore } from "@/stores/pipeline-store"
import type {
  PipelineSSEEvent,
  PipelineStepId,
  ConflictData,
  RepairActionData,
  LayoutItem,
  PipelineCompletedData,
  ModifierCompletedData,
  ClarificationNeededData,
} from "@/types/pipeline"
import type { FurnitureInstance } from "@/types/editor"

function layoutItemsToFurnitureInstances(
  items: LayoutItem[],
  existing: FurnitureInstance[] = []
): FurnitureInstance[] {
  // Preserve instanceId and model_url from items already in the scene
  // Key by instanceId since item.id from server is now the instanceId
  const existingMap = new Map(existing.map((f) => [f.instanceId, f]))

  return items.map((item, i) => {
    // item.id from server is the instanceId we sent
    const prev = existingMap.get(item.id) ?? existingMap.get(item.furniture_id)
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
      instanceId: prev?.instanceId ?? item.id,
      model_url: item.model_url ?? prev?.model_url,
      model_rotation_offset: item.model_rotation_offset ?? prev?.model_rotation_offset ?? 0,
    }
  })
}

export function useChat() {
  const addMessage = useChatStore((s) => s.addMessage)
  const updateMessage = useChatStore((s) => s.updateMessage)
  const setLoading = useChatStore((s) => s.setLoading)
  const setMode = useChatStore((s) => s.setMode)
  const mode = useChatStore((s) => s.mode)
  const messages = useChatStore((s) => s.messages)
  const conversationId = useChatStore((s) => s.conversationId)
  const projectId = useChatStore((s) => s.projectId)
  const setPendingClarification = useChatStore((s) => s.setPendingClarification)

  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)
  const setFengShuiScore = useEditorStore((s) => s.setFengShuiScore)
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const room = useEditorStore((s) => s.room)

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

  const abortRef = useRef<AbortController | null>(null)

  const persistMessage = (role: "user" | "assistant", content: string, intent?: string) => {
    const cid = useChatStore.getState().conversationId
    if (!cid || !content) return
    fetch(`/api/conversations/${cid}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, content, intent: intent ?? null }),
    }).catch(() => {/* silent */})
  }

  const send = useCallback(
    async (text: string, clarificationAnswers: Record<string, string> = {}) => {
      setLoading(true)

      // Persist user message (fire-and-forget)
      persistMessage("user", text)

      const messageId = `assistant-${Date.now()}`
      addMessage({
        id: messageId,
        role: "assistant",
        content: "",
        mode,
        timestamp: new Date(),
        isThinking: true,
      })

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const conversationHistory = messages
          .filter((m) => m.content)
          .map((m) => ({ role: m.role, content: m.content }))

        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            mode,
            current_layout: furnitureItems.map((f) => ({
              id: f.instanceId,
              furniture_id: f.instanceId,
              name: f.name,
              category: f.category,
              pos_x: f.pos_x,
              pos_y: f.pos_y,
              pos_z: f.pos_z,
              rotation: f.rotation,
              dimensions: f.dimensions,
              is_essential: f.is_essential,
              feng_shui_notes: f.feng_shui_notes,
            })),
            room_spec: {
              dimensions: { width: room.width, depth: room.depth },
              room_type: room.room_type,
              doors: room.doors,
              windows: room.windows,
              direction: room.direction,
              user_preferences: room.user_preferences ?? {},
            },
            conversation_history: conversationHistory,
            clarification_answers: clarificationAnswers,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const errText = await response.text().catch(() => "Unknown error")
          throw new Error(`Chat request failed: ${errText}`)
        }

        if (!response.body) {
          throw new Error("No response body")
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6)) as PipelineSSEEvent
                handleEvent(event, messageId)
              } catch {
                // skip malformed events
              }
            }
          }
        }

        // Ensure thinking state is cleared and persist assistant reply
        updateMessage(messageId, { isThinking: false })
        const assistantContent = useChatStore.getState().messages.find((m) => m.id === messageId)?.content
        if (assistantContent) persistMessage("assistant", assistantContent)
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const errMsg = err instanceof Error ? err.message : "Something went wrong"
        updateMessage(messageId, {
          content: `Error: ${errMsg}`,
          isThinking: false,
        })
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleEvent uses stable store actions
    [
      addMessage,
      updateMessage,
      setLoading,
      setMode,
      mode,
      messages,
      conversationId,
      projectId,
      furnitureItems,
      room,
      setFurnitureItems,
      setFengShuiScore,
      startPipeline,
      setStepStarted,
      setStepProgress,
      setStepCompleted,
      setStepFailed,
      addConflict,
      addRepairAction,
      setLayoutItems,
      completePipeline,
      failPipeline,
      setPendingClarification,
    ]
  )

  const submitClarification = useCallback(
    (answers: Record<string, string>) => {
      const pending = useChatStore.getState().pendingClarification
      if (!pending) return
      const merged = { ...pending.answers, ...answers }
      setPendingClarification(null)
      send(pending.originalMessage, merged)
    },
    [send, setPendingClarification]
  )

  function handleEvent(event: PipelineSSEEvent, messageId: string) {
    switch (event.type) {
      // --- Chat answer (question intent) ---
      case "answer":
        updateMessage(messageId, {
          content: event.answer as string,
          isThinking: false,
        })
        break

      // --- Modifier events ---
      case "modifier_started":
        updateMessage(messageId, { isThinking: true })
        break

      case "modifier_updated": {
        const items = event.items as LayoutItem[]
        const current = useEditorStore.getState().furnitureItems
        setFurnitureItems(layoutItemsToFurnitureInstances(items, current))
        break
      }

      case "modifier_completed": {
        const data = event as unknown as ModifierCompletedData
        if (data.layout_items?.length) {
          const current = useEditorStore.getState().furnitureItems
          setFurnitureItems(layoutItemsToFurnitureInstances(data.layout_items, current))
        }
        updateMessage(messageId, {
          content: data.explanation || "",
          isThinking: false,
        })
        break
      }

      // --- Mode change ---
      case "mode_changed":
        setMode(event.mode as "buddy" | "mentor" | "fun")
        updateMessage(messageId, {
          content: `เปลี่ยนเป็น ${event.mode} mode แล้ว`,
          isThinking: false,
        })
        break

      // --- Pipeline events (new_layout intent) ---
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
        setStepCompleted(event.step as PipelineStepId, event as Record<string, unknown>)
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
        const current = useEditorStore.getState().furnitureItems
        setFurnitureItems(layoutItemsToFurnitureInstances(items, current))
        break
      }

      case "pipeline_completed": {
        const data = event as unknown as PipelineCompletedData
        completePipeline(data)
        if (data.feng_shui_score) setFengShuiScore(data.feng_shui_score)
        updateMessage(messageId, {
          content: data.explanation || "",
          isThinking: false,
        })
        // Auto-save latest layout to backend (fire-and-forget)
        const pid = useChatStore.getState().projectId
        if (pid && data.layout_items?.length) {
          fetch(`/api/projects/${pid}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latest_layout: data.layout_items }),
          }).catch(() => {/* silent */})
        }
        break
      }

      case "pipeline_failed":
        failPipeline(event.error as string)
        updateMessage(messageId, {
          content: `Pipeline failed: ${event.error as string}`,
          isThinking: false,
        })
        break

      // --- Clarification (backend needs more info before running pipeline) ---
      case "clarification_needed": {
        const data = event as unknown as ClarificationNeededData
        setPendingClarification({
          messageId,
          originalMessage: data.original_message,
          questions: data.questions,
          answers: {},
        })
        updateMessage(messageId, {
          isThinking: false,
          clarificationQuestions: data.questions,
        })
        break
      }

      // router_classified — internal, no UI action needed
      case "router_classified":
        break
    }
  }

  return { send, submitClarification }
}

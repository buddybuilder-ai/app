"use client"

import { useCallback, useRef } from "react"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance } from "@/types/editor"

const MAX_HISTORY = 50

export function useUndoRedo() {
  const pastRef = useRef<FurnitureInstance[][]>([])
  const futureRef = useRef<FurnitureInstance[][]>([])

  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)

  const saveSnapshot = useCallback(() => {
    pastRef.current = [
      ...pastRef.current.slice(-MAX_HISTORY),
      furnitureItems.map((item) => ({ ...item })),
    ]
    futureRef.current = []
  }, [furnitureItems])

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return

    const previous = pastRef.current[pastRef.current.length - 1]
    pastRef.current = pastRef.current.slice(0, -1)
    futureRef.current = [
      ...futureRef.current,
      furnitureItems.map((item) => ({ ...item })),
    ]
    setFurnitureItems(previous)
  }, [furnitureItems, setFurnitureItems])

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return

    const next = futureRef.current[futureRef.current.length - 1]
    futureRef.current = futureRef.current.slice(0, -1)
    pastRef.current = [
      ...pastRef.current,
      furnitureItems.map((item) => ({ ...item })),
    ]
    setFurnitureItems(next)
  }, [furnitureItems, setFurnitureItems])

  return {
    undo,
    redo,
    saveSnapshot,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  }
}

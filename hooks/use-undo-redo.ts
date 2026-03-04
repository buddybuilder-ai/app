"use client"

import { useCallback, useRef, useState } from "react"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance } from "@/types/editor"

const MAX_HISTORY = 50

export function useUndoRedo() {
  const pastRef = useRef<FurnitureInstance[][]>([])
  const futureRef = useRef<FurnitureInstance[][]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const setFurnitureItems = useEditorStore((s) => s.setFurnitureItems)

  const saveSnapshot = useCallback(() => {
    pastRef.current = [
      ...pastRef.current.slice(-MAX_HISTORY),
      furnitureItems.map((item) => ({ ...item })),
    ]
    futureRef.current = []
    setCanUndo(true)
    setCanRedo(false)
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
    setCanUndo(pastRef.current.length > 0)
    setCanRedo(true)
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
    setCanUndo(true)
    setCanRedo(futureRef.current.length > 0)
  }, [furnitureItems, setFurnitureItems])

  return {
    undo,
    redo,
    saveSnapshot,
    canUndo,
    canRedo,
  }
}

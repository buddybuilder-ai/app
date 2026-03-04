"use client"

import { OrbitControls } from "@react-three/drei"
import { useEditorStore } from "@/stores/editor-store"

export function CameraControls() {
  const isGizmoDragging = useEditorStore((s) => s.isGizmoDragging)

  return (
    <OrbitControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={2}
      maxDistance={20}
      enableDamping
      dampingFactor={0.05}
      enabled={!isGizmoDragging}
    />
  )
}

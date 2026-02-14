"use client"

import { OrbitControls } from "@react-three/drei"

export function CameraControls() {
  return (
    <OrbitControls
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={2}
      maxDistance={20}
      enableDamping
      dampingFactor={0.05}
    />
  )
}

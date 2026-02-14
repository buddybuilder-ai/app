"use client"

import { Canvas } from "@react-three/fiber"
import { LightingRig } from "./lighting-rig"
import { CameraControls } from "./camera-controls"
import { GridHelper } from "./grid-helper"
import { RoomMesh } from "./room-mesh"

export function SceneCanvas() {
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: [6, 6, 6], fov: 50 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#fafafa"]} />
        <LightingRig />
        <CameraControls />
        <GridHelper />
        <RoomMesh />
      </Canvas>
    </div>
  )
}

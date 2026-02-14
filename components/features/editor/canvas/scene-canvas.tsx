"use client"

import { Canvas } from "@react-three/fiber"
import { LightingRig } from "./lighting-rig"
import { CameraControls } from "./camera-controls"
import { GridHelper } from "./grid-helper"
import { RoomMesh } from "./room-mesh"
import { FurnitureMesh } from "./furniture-mesh"
import { useEditorStore } from "@/stores/editor-store"
import { useFurnitureDrag } from "@/hooks/use-furniture-drag"

function FurnitureLayer() {
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)

  return (
    <group onPointerMissed={() => setSelectedId(null)}>
      {furnitureItems.map((item) => (
        <FurnitureMesh key={item.instanceId} item={item} />
      ))}
    </group>
  )
}

export function SceneCanvas() {
  const { handleCanvasDrop, handleCanvasDragOver } = useFurnitureDrag()

  return (
    <div
      className="absolute inset-0"
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
    >
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
        <FurnitureLayer />
      </Canvas>
    </div>
  )
}

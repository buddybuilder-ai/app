"use client"

import { Canvas } from "@react-three/fiber"
import { LightingRig } from "./lighting-rig"
import { CameraControls } from "./camera-controls"
import { GridHelper } from "./grid-helper"
import { RoomMesh } from "./room-mesh"
import { FurnitureMeshWithGizmo } from "./furniture-mesh"
import { useEditorStore } from "@/stores/editor-store"
import { useFurnitureDrag } from "@/hooks/use-furniture-drag"

function FurnitureLayer() {
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)

  return (
    <group onPointerMissed={() => setSelectedId(null)}>
      {furnitureItems.map((item) => (
        <FurnitureMeshWithGizmo key={item.instanceId} item={item} />
      ))}
    </group>
  )
}

export function SceneCanvas() {
  const { handleCanvasDrop, handleCanvasDragOver } = useFurnitureDrag()
  const activeTool = useEditorStore((s) => s.activeTool)

  // Get cursor style based on active tool
  const getCursorStyle = () => {
    switch (activeTool) {
      case "move":
        return "move"
      case "rotate":
        return "grab"
      case "delete":
        return "not-allowed"
      default:
        return "default"
    }
  }

  return (
    <div
      className="absolute inset-0"
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
      style={{ cursor: getCursorStyle() }}
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

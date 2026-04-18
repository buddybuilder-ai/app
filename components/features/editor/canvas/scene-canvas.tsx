"use client"

import { Canvas } from "@react-three/fiber"
import { LightingRig } from "./lighting-rig"
import { CameraControls } from "./camera-controls"
import { GridHelper } from "./grid-helper"
import { RoomMesh } from "./room-mesh"
import { FurnitureMeshWithGizmo } from "./furniture-mesh"
import { useEditorStore } from "@/stores/editor-store"
import { useFurnitureDrag } from "@/hooks/use-furniture-drag"

import { Html } from "@react-three/drei"

// Compass labels placed in 3D space so they move with the camera.
// scene coords: north wall = z=-halfD, south = z=+halfD, west = x=-halfW, east = x=+halfW
// room.direction = which real compass direction the scene's "north wall" faces.
const DIRECTION_CYCLE = ["north", "east", "south", "west"] as const
type Dir = (typeof DIRECTION_CYCLE)[number]

function rotateDir(base: Dir, steps: number): Dir {
  const idx = DIRECTION_CYCLE.indexOf(base)
  return DIRECTION_CYCLE[(idx + steps + 4) % 4]
}

function WallDirectionLabels() {
  const room = useEditorStore((s) => s.room)
  const direction = (room.direction ?? "north") as Dir

  const halfW = room.width / 2
  const halfD = room.depth / 2
  const labelY = 0.15  // just above floor

  // scene wall → actual compass direction
  const northLabel = direction                // −z wall
  const eastLabel  = rotateDir(direction, 1) // +x wall
  const southLabel = rotateDir(direction, 2) // +z wall
  const westLabel  = rotateDir(direction, 3) // −x wall

  const labels = [
    { label: northLabel, pos: [0, labelY, -halfD + 0.12] as [number, number, number] },
    { label: southLabel, pos: [0, labelY,  halfD - 0.12] as [number, number, number] },
    { label: westLabel,  pos: [-halfW + 0.12, labelY, 0] as [number, number, number] },
    { label: eastLabel,  pos: [ halfW - 0.12, labelY, 0] as [number, number, number] },
  ]

  return (
    <>
      {labels.map(({ label, pos }) => (
        <Html key={label} position={pos} center>
          <span
            style={{ pointerEvents: "none", userSelect: "none" }}
            className="rounded bg-black/50 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
          >
            {label.toUpperCase().charAt(0)}
          </span>
        </Html>
      ))}
    </>
  )
}

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
      data-editor-canvas
      className="absolute inset-0"
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
      style={{ cursor: getCursorStyle() }}
    >
      <Canvas
        shadows
        camera={{ position: [6, 6, 6], fov: 50 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={["#fafafa"]} />
        <LightingRig />
        <CameraControls />
        <GridHelper />
        <RoomMesh />
        <FurnitureLayer />
        <WallDirectionLabels />
      </Canvas>
    </div>
  )
}

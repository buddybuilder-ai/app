"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { useEffect } from "react"
import type { PerspectiveCamera } from "three"
import { LightingRig } from "./lighting-rig"
import { RoomMesh } from "./room-mesh"
import { FurnitureMeshWithGizmo } from "./furniture-mesh"
import { useEditorStore } from "@/stores/editor-store"

export type CameraPreset = "front" | "back" | "left" | "right" | "top" | "isometric"

type WallSide = "north" | "south" | "east" | "west"

// Hide the walls that would otherwise block the camera's view of the room
// interior. "front" means the camera is on the +Z side, so the south wall
// is what's between the camera and the room → hide it.
function hideWallsFor(preset: CameraPreset): WallSide[] {
  switch (preset) {
    case "front":
      return ["south"]
    case "back":
      return ["north"]
    case "left":
      return ["west"]
    case "right":
      return ["east"]
    case "top":
      return ["north", "south", "east", "west"]
    case "isometric":
      // Camera sits in the +x/+z/+y octant, so the south + east walls are
      // closest and block the view.
      return ["south", "east"]
  }
}

export interface CameraPose {
  position: [number, number, number]
  target: [number, number, number]
  fov: number
}

// Pose factory — uses room half-extents to keep the whole room in frame no
// matter the room size. All poses look at room centre (0, 0, 0).
export function poseFor(
  preset: CameraPreset,
  halfW: number,
  halfD: number,
  height: number
): CameraPose {
  const maxSide = Math.max(halfW, halfD)
  const pull = maxSide * 2.6
  switch (preset) {
    case "front":
      // Looking from south (+Z) toward north wall
      return { position: [0, height * 0.55, pull], target: [0, 0.4, 0], fov: 45 }
    case "back":
      return { position: [0, height * 0.55, -pull], target: [0, 0.4, 0], fov: 45 }
    case "left":
      return { position: [-pull, height * 0.55, 0], target: [0, 0.4, 0], fov: 45 }
    case "right":
      return { position: [pull, height * 0.55, 0], target: [0, 0.4, 0], fov: 45 }
    case "top":
      return { position: [0, Math.max(pull, height * 2.5), 0.001], target: [0, 0, 0], fov: 45 }
    case "isometric":
      return { position: [pull * 0.85, pull * 0.75, pull * 0.85], target: [0, 0.4, 0], fov: 40 }
  }
}

function CameraDriver({ pose }: { pose: CameraPose }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(...pose.position)
    camera.lookAt(...pose.target)
    if ("fov" in camera) {
      ;(camera as PerspectiveCamera).fov = pose.fov
      ;(camera as PerspectiveCamera).updateProjectionMatrix()
    }
  }, [camera, pose])
  return null
}

function FurnitureLayer() {
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  return (
    <group>
      {furnitureItems.map((item) => (
        <FurnitureMeshWithGizmo key={item.instanceId} item={item} />
      ))}
    </group>
  )
}

interface RenderSceneCanvasProps {
  preset: CameraPreset
}

export function RenderSceneCanvas({ preset }: RenderSceneCanvasProps) {
  const room = useEditorStore((s) => s.room)
  const pose = poseFor(preset, room.width / 2, room.depth / 2, room.height)
  const hiddenWalls = hideWallsFor(preset)
  return (
    <div data-render-canvas className="absolute inset-0">
      <Canvas
        shadows
        camera={{ position: pose.position, fov: pose.fov }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        <color attach="background" args={["#f4f1ec"]} />
        <LightingRig />
        <RoomMesh hideWallSides={hiddenWalls} />
        <FurnitureLayer />
        <CameraDriver pose={pose} />
      </Canvas>
    </div>
  )
}

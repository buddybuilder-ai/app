"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance } from "@/types/editor"

/**
 * Consumer-friendly furniture gizmo — no CAD-style XYZ arrows.
 *
 * Layout (centred on the item's footprint, just above the floor):
 *   • Inner translucent disc: drag anywhere inside → moves the item on the floor plane (XZ)
 *   • Outer thin ring:        drag tangentially   → rotates the item around Y (yaw)
 *
 * Snap values:
 *   • Translation: 0.1 m (= 10 cm), matches the room's grid_cell_size
 *   • Rotation:    15°  (hold Shift to disable and get free rotation)
 *
 * Movement is floor-locked (pos_y is never touched); pitch/roll is hidden — non-architect
 * users never need to tilt a sofa sideways.
 */

interface FurnitureGizmoProps {
  item: FurnitureInstance
}

const PRIMARY = "#f59e0b" // tailwind amber-500, matches app primary
const RING_THICKNESS = 0.04
const DISC_PADDING = 0.15 // extra radius around the item footprint
const RING_PADDING = 0.4 // gap between disc edge and rotation ring
const FLOOR_Y_OFFSET = 0.015 // lift above floor so shadows don't z-fight
const MOVE_SNAP = 0.1 // metres
const ROTATE_SNAP_DEG = 15

function snap(value: number, step: number): number {
  return Math.round(value / step) * step
}

export function FurnitureGizmo({ item }: FurnitureGizmoProps) {
  const { camera, raycaster, gl } = useThree()
  const updateFurniture = useEditorStore((s) => s.updateFurniture)
  const beginTransaction = useEditorStore((s) => s.beginTransaction)
  const room = useEditorStore((s) => s.room)
  const setIsGizmoDragging = useEditorStore((s) => s.setIsGizmoDragging)

  const [hoverZone, setHoverZone] = useState<"move" | "rotate" | null>(null)
  const [activeZone, setActiveZone] = useState<"move" | "rotate" | null>(null)

  const isDraggingRef = useRef(false)
  const activeZoneRef = useRef<"move" | "rotate" | null>(null)
  const floorPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const dragStartPoint = useRef(new THREE.Vector3())
  const initialPos = useRef({ x: 0, z: 0 })
  const initialRotDeg = useRef(0)
  const startAngle = useRef(0)
  const pivot = useRef(new THREE.Vector3())

  // Derived sizes from the item footprint — gizmo scales with the piece of furniture
  const footprintRadius = Math.max(item.dimensions.width, item.dimensions.depth) / 2
  const discRadius = footprintRadius + DISC_PADDING
  const ringInner = discRadius + RING_PADDING
  const ringOuter = ringInner + 0.12

  useEffect(() => {
    isDraggingRef.current = activeZone !== null
    activeZoneRef.current = activeZone
  }, [activeZone])

  const screenToFloor = useCallback(
    (clientX: number, clientY: number, out: THREE.Vector3): boolean => {
      const rect = gl.domElement.getBoundingClientRect()
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
      const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
      const hit = raycaster.ray.intersectPlane(floorPlane.current, out)
      return hit !== null
    },
    [camera, gl, raycaster]
  )

  const handleDragStart = useCallback(
    (zone: "move" | "rotate", e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      const native = e.nativeEvent as PointerEvent
      const target = native.target as HTMLElement | null
      if (target && "setPointerCapture" in target) {
        target.setPointerCapture(native.pointerId)
      }

      setActiveZone(zone)
      setIsGizmoDragging(true)
      beginTransaction()

      pivot.current.set(item.pos_x, 0, item.pos_z)
      initialPos.current = { x: item.pos_x, z: item.pos_z }
      initialRotDeg.current = item.rotation

      const hit = new THREE.Vector3()
      if (!screenToFloor(native.clientX, native.clientY, hit)) return
      dragStartPoint.current.copy(hit)

      if (zone === "rotate") {
        startAngle.current = Math.atan2(
          hit.z - pivot.current.z,
          hit.x - pivot.current.x
        )
      }
      document.body.style.cursor = "grabbing"
    },
    [item.pos_x, item.pos_z, item.rotation, screenToFloor, setIsGizmoDragging, beginTransaction]
  )

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingRef.current) return
      const zone = activeZoneRef.current
      if (!zone) return

      const hit = new THREE.Vector3()
      if (!screenToFloor(e.clientX, e.clientY, hit)) return

      if (zone === "move") {
        const dx = hit.x - dragStartPoint.current.x
        const dz = hit.z - dragStartPoint.current.z
        let newX = initialPos.current.x + dx
        let newZ = initialPos.current.z + dz

        // Room-bound clamp
        const hw = item.dimensions.width / 2
        const hd = item.dimensions.depth / 2
        newX = Math.max(-room.width / 2 + hw, Math.min(room.width / 2 - hw, newX))
        newZ = Math.max(-room.depth / 2 + hd, Math.min(room.depth / 2 - hd, newZ))

        // Shift disables snapping for precision placement
        if (!e.shiftKey) {
          newX = snap(newX, MOVE_SNAP)
          newZ = snap(newZ, MOVE_SNAP)
        }

        updateFurniture(item.instanceId, { pos_x: newX, pos_z: newZ }, { skipHistory: true })
      } else {
        // Rotate: angle around pivot
        const angle = Math.atan2(hit.z - pivot.current.z, hit.x - pivot.current.x)
        let delta = angle - startAngle.current
        while (delta > Math.PI) delta -= 2 * Math.PI
        while (delta < -Math.PI) delta += 2 * Math.PI

        let newRot = initialRotDeg.current + (delta * 180) / Math.PI
        while (newRot < 0) newRot += 360
        while (newRot >= 360) newRot -= 360

        if (!e.shiftKey) newRot = snap(newRot, ROTATE_SNAP_DEG)
        updateFurniture(item.instanceId, { rotation: newRot }, { skipHistory: true })
      }
    },
    [
      item.dimensions.width,
      item.dimensions.depth,
      item.instanceId,
      room.depth,
      room.width,
      screenToFloor,
      updateFurniture,
    ]
  )

  const handlePointerUp = useCallback(() => {
    if (!isDraggingRef.current) return
    setActiveZone(null)
    setIsGizmoDragging(false)
    document.body.style.cursor = "auto"
  }, [setIsGizmoDragging])

  useEffect(() => {
    if (activeZone) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      return () => {
        window.removeEventListener("pointermove", handlePointerMove)
        window.removeEventListener("pointerup", handlePointerUp)
      }
    }
  }, [activeZone, handlePointerMove, handlePointerUp])

  const moveHovered = hoverZone === "move" || activeZone === "move"
  const rotateHovered = hoverZone === "rotate" || activeZone === "rotate"

  return (
    <group position={[item.pos_x, FLOOR_Y_OFFSET, item.pos_z]}>
      {/* Inner translucent disc — drag to move */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoverZone("move")
          document.body.style.cursor = "grab"
        }}
        onPointerOut={() => {
          setHoverZone((z) => (z === "move" ? null : z))
          if (!activeZone) document.body.style.cursor = "auto"
        }}
        onPointerDown={(e) => handleDragStart("move", e)}
      >
        <circleGeometry args={[discRadius, 48]} />
        <meshBasicMaterial
          color={PRIMARY}
          transparent
          opacity={moveHovered ? 0.25 : 0.12}
          depthWrite={false}
        />
      </mesh>
      {/* Disc outline */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[discRadius - 0.01, discRadius + 0.01, 64]} />
        <meshBasicMaterial
          color={PRIMARY}
          transparent
          opacity={moveHovered ? 0.8 : 0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Outer rotation ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoverZone("rotate")
          document.body.style.cursor = "grab"
        }}
        onPointerOut={() => {
          setHoverZone((z) => (z === "rotate" ? null : z))
          if (!activeZone) document.body.style.cursor = "auto"
        }}
        onPointerDown={(e) => handleDragStart("rotate", e)}
      >
        <ringGeometry args={[ringInner, ringOuter, 64]} />
        <meshBasicMaterial
          color={PRIMARY}
          transparent
          opacity={rotateHovered ? 0.9 : 0.55}
          depthWrite={false}
        />
      </mesh>

      {/* Four small "notch" ticks on the rotation ring to hint it spins */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180
        const tickRadius = (ringInner + ringOuter) / 2
        return (
          <mesh
            key={deg}
            position={[Math.cos(rad) * tickRadius, 0.003, Math.sin(rad) * tickRadius]}
            rotation={[-Math.PI / 2, 0, -rad]}
          >
            <planeGeometry args={[RING_THICKNESS * 1.5, RING_THICKNESS * 3]} />
            <meshBasicMaterial
              color={PRIMARY}
              transparent
              opacity={rotateHovered ? 1 : 0.7}
              depthWrite={false}
            />
          </mesh>
        )
      })}

      {/* Small dot marking the item's facing direction on the rotation ring */}
      {(() => {
        const rad = (item.rotation * Math.PI) / 180
        const r = (ringInner + ringOuter) / 2
        return (
          <mesh
            position={[Math.sin(rad) * r, 0.004, Math.cos(rad) * r]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.06, 24]} />
            <meshBasicMaterial color={PRIMARY} transparent opacity={1} depthWrite={false} />
          </mesh>
        )
      })()}
    </group>
  )
}

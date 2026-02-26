"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import type { ThreeEvent } from "@react-three/fiber"
import * as THREE from "three"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance } from "@/types/editor"

// Axis colors following Unity/Blender conventions
const AXIS_COLORS = {
  x: "#ff4444", // Red for X axis
  y: "#44ff44", // Green for Y axis  
  z: "#4444ff", // Blue for Z axis
}

const AXIS_HOVER_COLORS = {
  x: "#ff8888",
  y: "#88ff88",
  z: "#8888ff",
}

const RING_RADIUS = 1.0
const RING_TUBE_RADIUS = 0.02
const SCALE_MULTIPLIER = 0.5

type AxisType = "x" | "y" | "z"

interface RotationRingProps {
  axis: AxisType
  isSelected: boolean
  onDragStart: (axis: AxisType, e: ThreeEvent<PointerEvent>) => void
  isHovered: boolean
  onHover: (axis: AxisType | null) => void
  scale: number
}

function RotationRing({ 
  axis, 
  isSelected, 
  onDragStart, 
  isHovered, 
  onHover,
  scale 
}: RotationRingProps) {
  // Get rotation for each axis ring
  // X-axis ring lies on YZ plane, so rotate 90 degrees around Z
  // Y-axis ring lies on XZ plane (default)
  // Z-axis ring lies on XY plane, so rotate 90 degrees around X
  const rotation: [number, number, number] = 
    axis === "x" ? [0, 0, Math.PI / 2] :
    axis === "z" ? [Math.PI / 2, 0, 0] :
    [0, 0, 0]
  
  const color = isHovered ? AXIS_HOVER_COLORS[axis] : AXIS_COLORS[axis]
  const scaledRadius = RING_RADIUS * scale
  const scaledTubeRadius = RING_TUBE_RADIUS * scale

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(axis)
    document.body.style.cursor = "grab"
  }, [axis, onHover])

  const handlePointerOut = useCallback(() => {
    onHover(null)
    document.body.style.cursor = "auto"
  }, [onHover])

  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onDragStart(axis, e)
  }, [axis, onDragStart])

  return (
    <mesh
      rotation={rotation}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
    >
      <torusGeometry args={[scaledRadius, scaledTubeRadius, 16, 64]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color}
        emissiveIntensity={isHovered || isSelected ? 0.5 : 0.2}
        transparent
        opacity={isSelected ? 1 : 0.8}
      />
    </mesh>
  )
}

interface RotationGizmoProps {
  item: FurnitureInstance
}

export function RotationGizmo({ item }: RotationGizmoProps) {
  const { camera, raycaster, gl } = useThree()
  const updateFurniture = useEditorStore((s) => s.updateFurniture)
  const setIsGizmoDragging = useEditorStore((s) => s.setIsGizmoDragging)
  
  const [isDragging, setIsDragging] = useState(false)
  const [activeAxis, setActiveAxis] = useState<AxisType | null>(null)
  const [hoveredAxis, setHoveredAxis] = useState<AxisType | null>(null)
  
  const initialRotation = useRef(item.rotation)
  const isDraggingRef = useRef(false)
  const activeAxisRef = useRef<AxisType | null>(null)
  const dragStartAngle = useRef(0)
  const gizmoPosition = useRef(new THREE.Vector3())

  // Calculate gizmo scale based on camera distance
  const [gizmoScale, setGizmoScale] = useState(1)
  
  useFrame(() => {
    if (!isDragging) {
      const position = new THREE.Vector3(
        item.pos_x,
        item.dimensions.height / 2 + item.pos_y,
        item.pos_z
      )
      const distance = camera.position.distanceTo(position)
      const newScale = Math.max(0.3, Math.min(2, distance * SCALE_MULTIPLIER))
      if (Math.abs(newScale - gizmoScale) > 0.01) {
        setGizmoScale(newScale)
      }
    }
  })

  // Update refs when state changes
  useEffect(() => {
    isDraggingRef.current = isDragging
    activeAxisRef.current = activeAxis
  }, [isDragging, activeAxis])

  // Calculate angle from mouse position to gizmo center
  const calculateAngle = useCallback((e: PointerEvent, axis: AxisType): number => {
    const rect = gl.domElement.getBoundingClientRect()
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    
    // Raycast to find intersection with the rotation plane
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
    
    // Create a plane for the rotation axis
    const planeNormal = new THREE.Vector3(
      axis === "x" ? 1 : 0,
      axis === "y" ? 1 : 0,
      axis === "z" ? 1 : 0
    )
    
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, gizmoPosition.current)
    
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, intersection)
    
    if (intersection) {
      // Calculate angle from gizmo center to intersection point
      const delta = intersection.clone().sub(gizmoPosition.current)
      
      if (axis === "y") {
        // Y-axis rotation: angle on XZ plane
        return Math.atan2(delta.z, delta.x)
      } else if (axis === "x") {
        // X-axis rotation: angle on YZ plane
        return Math.atan2(delta.z, delta.y)
      } else {
        // Z-axis rotation: angle on XY plane
        return Math.atan2(delta.y, delta.x)
      }
    }
    
    return 0
  }, [camera, raycaster, gl])

  const handleDragStart = useCallback((axis: AxisType, e: ThreeEvent<PointerEvent>) => {
    // Capture pointer for continuous dragging
    const nativeEvent = e.nativeEvent as PointerEvent
    if (nativeEvent.target && 'setPointerCapture' in nativeEvent.target) {
      ;(nativeEvent.target as HTMLElement).setPointerCapture(nativeEvent.pointerId)
    }
    
    setIsDragging(true)
    setActiveAxis(axis)
    setIsGizmoDragging(true)
    
    // Store initial rotation
    initialRotation.current = item.rotation
    
    // Store gizmo position
    gizmoPosition.current.set(
      item.pos_x,
      item.dimensions.height / 2 + item.pos_y,
      item.pos_z
    )
    
    // Calculate initial angle
    dragStartAngle.current = calculateAngle(e.nativeEvent as unknown as PointerEvent, axis)
    
    document.body.style.cursor = "grabbing"
  }, [item, setIsGizmoDragging, calculateAngle])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current || !activeAxisRef.current) return
    
    const axis = activeAxisRef.current
    const currentAngle = calculateAngle(e, axis)
    let angleDelta = currentAngle - dragStartAngle.current
    
    // Normalize angle delta to prevent jumps
    while (angleDelta > Math.PI) angleDelta -= 2 * Math.PI
    while (angleDelta < -Math.PI) angleDelta += 2 * Math.PI
    
    // Convert to degrees and add to initial rotation
    let newRotation = initialRotation.current + (angleDelta * 180) / Math.PI
    
    // Normalize rotation to 0-360 range
    while (newRotation < 0) newRotation += 360
    while (newRotation >= 360) newRotation -= 360
    
    // Round to 1 decimal place
    newRotation = Math.round(newRotation * 10) / 10
    
    updateFurniture(item.instanceId, {
      rotation: newRotation,
    })
  }, [calculateAngle, updateFurniture, item.instanceId])

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current) {
      setIsDragging(false)
      setActiveAxis(null)
      setIsGizmoDragging(false)
      document.body.style.cursor = "auto"
    }
  }, [setIsGizmoDragging])

  // Add global pointer move and up handlers
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      
      return () => {
        window.removeEventListener("pointermove", handlePointerMove)
        window.removeEventListener("pointerup", handlePointerUp)
      }
    }
  }, [isDragging, handlePointerMove, handlePointerUp])

  return (
    <group
      position={[
        item.pos_x,
        item.dimensions.height / 2 + item.pos_y,
        item.pos_z,
      ]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
    >
      {/* Z Axis Ring (Blue) - Primary rotation for furniture */}
      <RotationRing
        axis="z"
        isSelected={activeAxis === "z"}
        isHovered={hoveredAxis === "z"}
        onDragStart={handleDragStart}
        onHover={setHoveredAxis}
        scale={gizmoScale}
      />
      
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[RING_TUBE_RADIUS * gizmoScale * 2, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff"
          emissiveIntensity={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}

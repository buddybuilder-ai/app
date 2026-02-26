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

const ARROW_LENGTH = 1.2
const ARROW_HEAD_LENGTH = 0.3
const ARROW_HEAD_RADIUS = 0.08
const SHAFT_RADIUS = 0.02
const SCALE_MULTIPLIER = 0.5

type AxisType = "x" | "y" | "z"

interface AxisArrowProps {
  axis: AxisType
  isSelected: boolean
  onDragStart: (axis: AxisType, e: ThreeEvent<PointerEvent>) => void
  isHovered: boolean
  onHover: (axis: AxisType | null) => void
  scale: number
}

function AxisArrow({ 
  axis, 
  isSelected, 
  onDragStart, 
  isHovered, 
  onHover,
  scale 
}: AxisArrowProps) {
  const meshRef = useRef<THREE.Group>(null)
  
  // Get rotation for each axis
  const rotation: [number, number, number] = 
    axis === "x" ? [0, 0, -Math.PI / 2] :
    axis === "z" ? [Math.PI / 2, 0, 0] :
    [0, 0, 0]
  
  const color = isHovered ? AXIS_HOVER_COLORS[axis] : AXIS_COLORS[axis]
  const scaledLength = ARROW_LENGTH * scale
  const scaledHeadLength = ARROW_HEAD_LENGTH * scale
  const scaledHeadRadius = ARROW_HEAD_RADIUS * scale
  const scaledShaftRadius = SHAFT_RADIUS * scale

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    onHover(axis)
    document.body.style.cursor = "pointer"
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
    <group 
      ref={meshRef} 
      rotation={rotation}
      scale={[1, 1, 1]}
    >
      {/* Arrow shaft */}
      <mesh
        position={[0, scaledLength / 2 - scaledHeadLength / 2, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        <cylinderGeometry args={[scaledShaftRadius, scaledShaftRadius, scaledLength - scaledHeadLength, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          transparent
          opacity={isSelected ? 1 : 0.8}
        />
      </mesh>
      
      {/* Arrow head (cone) */}
      <mesh
        position={[0, scaledLength, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      >
        <coneGeometry args={[scaledHeadRadius, scaledHeadLength, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          transparent
          opacity={isSelected ? 1 : 0.8}
        />
      </mesh>
    </group>
  )
}

interface TransformGizmoProps {
  item: FurnitureInstance
}

export function TransformGizmo({ item }: TransformGizmoProps) {
  const { camera, raycaster, gl } = useThree()
  const updateFurniture = useEditorStore((s) => s.updateFurniture)
  const room = useEditorStore((s) => s.room)
  const setIsGizmoDragging = useEditorStore((s) => s.setIsGizmoDragging)
  
  const [isDragging, setIsDragging] = useState(false)
  const [activeAxis, setActiveAxis] = useState<AxisType | null>(null)
  const [hoveredAxis, setHoveredAxis] = useState<AxisType | null>(null)
  
  const dragPlane = useRef(new THREE.Plane())
  const dragStartPoint = useRef(new THREE.Vector3())
  const initialPosition = useRef({ x: item.pos_x, y: item.pos_y, z: item.pos_z })
  const isDraggingRef = useRef(false)
  const activeAxisRef = useRef<AxisType | null>(null)

  // Calculate gizmo scale based on camera distance
  const [gizmoScale, setGizmoScale] = useState(1)
  
  useFrame(() => {
    if (!isDragging) {
      const gizmoPosition = new THREE.Vector3(
        item.pos_x,
        item.dimensions.height / 2 + item.pos_y,
        item.pos_z
      )
      const distance = camera.position.distanceTo(gizmoPosition)
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

  const handleDragStart = useCallback((axis: AxisType, e: ThreeEvent<PointerEvent>) => {
    // Capture pointer for continuous dragging using the native event
    const nativeEvent = e.nativeEvent as PointerEvent
    if (nativeEvent.target && 'setPointerCapture' in nativeEvent.target) {
      ;(nativeEvent.target as HTMLElement).setPointerCapture(nativeEvent.pointerId)
    }
    
    setIsDragging(true)
    setActiveAxis(axis)
    setIsGizmoDragging(true)
    
    // Store initial position
    initialPosition.current = { 
      x: item.pos_x, 
      y: item.pos_y, 
      z: item.pos_z 
    }
    
    // Create a drag plane that passes through the object and faces the camera
    const itemPosition = new THREE.Vector3(
      item.pos_x,
      item.dimensions.height / 2 + item.pos_y,
      item.pos_z
    )
    
    // Get camera direction for plane orientation
    const cameraDirection = new THREE.Vector3()
    camera.getWorldDirection(cameraDirection)
    
    // Create a plane facing the camera that passes through the item
    // This plane will be used to find where the mouse ray intersects
    dragPlane.current.setFromNormalAndCoplanarPoint(
      cameraDirection.negate(), // Plane faces camera
      itemPosition
    )
    
    // Find initial intersection point on the plane
    const intersection = new THREE.Vector3()
    raycaster.setFromCamera(
      new THREE.Vector2(
        (e.clientX / gl.domElement.clientWidth) * 2 - 1,
        -(e.clientY / gl.domElement.clientHeight) * 2 + 1
      ),
      camera
    )
    raycaster.ray.intersectPlane(dragPlane.current, intersection)
    
    // Store the initial intersection point on the axis
    if (axis === "x") {
      dragStartPoint.current.set(intersection.x, 0, 0)
    } else if (axis === "y") {
      dragStartPoint.current.set(0, intersection.y, 0)
    } else {
      dragStartPoint.current.set(0, 0, intersection.z)
    }
    
    document.body.style.cursor = "grabbing"
  }, [item, camera, raycaster, gl])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current || !activeAxisRef.current) return
    
    // Calculate normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect()
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1
    
    // Raycast to find intersection with the drag plane
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
    const intersection = new THREE.Vector3()
    raycaster.ray.intersectPlane(dragPlane.current, intersection)
    
    if (intersection) {
      const axis = activeAxisRef.current
      
      // Calculate new position based on mouse position projected onto axis
      let newPos = { ...initialPosition.current }
      
      // Get the current axis component from the intersection
      // and calculate the offset from the start point
      if (axis === "x") {
        const offset = intersection.x - dragStartPoint.current.x
        newPos.x = initialPosition.current.x + offset
      } else if (axis === "y") {
        const offset = intersection.y - dragStartPoint.current.y
        newPos.y = initialPosition.current.y + offset
      } else if (axis === "z") {
        const offset = intersection.z - dragStartPoint.current.z
        newPos.z = initialPosition.current.z + offset
      }
      
      // Clamp to room bounds
      const halfWidth = item.dimensions.width / 2
      const halfDepth = item.dimensions.depth / 2
      
      newPos.x = Math.max(-room.width / 2 + halfWidth, Math.min(room.width / 2 - halfWidth, newPos.x))
      newPos.z = Math.max(-room.depth / 2 + halfDepth, Math.min(room.depth / 2 - halfDepth, newPos.z))
      newPos.y = Math.max(0, newPos.y) // Keep above floor
      
      // Round to 1 decimal place
      newPos.x = Math.round(newPos.x * 10) / 10
      newPos.y = Math.round(newPos.y * 10) / 10
      newPos.z = Math.round(newPos.z * 10) / 10
      
      updateFurniture(item.instanceId, {
        pos_x: newPos.x,
        pos_y: newPos.y,
        pos_z: newPos.z,
      })
    }
  }, [camera, raycaster, gl, updateFurniture, item.instanceId, item.dimensions, room])

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
      {/* X Axis Arrow */}
      <AxisArrow
        axis="x"
        isSelected={activeAxis === "x"}
        isHovered={hoveredAxis === "x"}
        onDragStart={handleDragStart}
        onHover={setHoveredAxis}
        scale={gizmoScale}
      />
      
      {/* Y Axis Arrow */}
      <AxisArrow
        axis="y"
        isSelected={activeAxis === "y"}
        isHovered={hoveredAxis === "y"}
        onDragStart={handleDragStart}
        onHover={setHoveredAxis}
        scale={gizmoScale}
      />
      
      {/* Z Axis Arrow */}
      <AxisArrow
        axis="z"
        isSelected={activeAxis === "z"}
        isHovered={hoveredAxis === "z"}
        onDragStart={handleDragStart}
        onHover={setHoveredAxis}
        scale={gizmoScale}
      />
      
      {/* Center sphere */}
      <mesh>
        <sphereGeometry args={[SHAFT_RADIUS * gizmoScale * 2, 16, 16]} />
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
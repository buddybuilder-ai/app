"use client"

import { useRef, useMemo, useEffect, Suspense } from "react"
import { BoxGeometry, Box3, Vector3, ArrowHelper, type Group, type Mesh, type Object3D, type Material } from "three"
import { useGLTF } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance } from "@/types/editor"
import { FurnitureGizmo } from "./furniture-gizmo"
import { FengShuiAlert } from "./feng-shui-alert"

// Short tween for AI/chat-triggered moves — slow enough to read, fast
// enough not to feel sluggish. Tuned to finish in ~0.6s at 60fps.
const ANIM_LERP_FACTOR = 0.12
const ANIM_SNAP_EPSILON = 0.001
// When the gap between current and target is bigger than this the item was
// *teleported* (e.g. initial mount), so we snap immediately instead of
// dragging a long streak across the room.
const ANIM_MAX_DISTANCE = 50

function shortestAngleDelta(from: number, to: number): number {
  let d = (to - from) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return d
}

// Debug: show front-facing arrow on furniture (red = front direction)
function FrontArrow({ height }: { height: number }) {
  const arrow = useMemo(() => {
    const dir = new Vector3(0, 0, 1) // +Z = front in local space
    const origin = new Vector3(0, height / 2 + 0.05, 0)
    return new ArrowHelper(dir, origin, 0.5, 0xff0000, 0.15, 0.1)
  }, [height])
  return <primitive object={arrow} />
}

const CATEGORY_COLORS: Record<string, string> = {
  bed: "#8B7355",
  wardrobe: "#A0522D",
  nightstand: "#D2B48C",
  dresser: "#BC8F8F",
  sofa: "#6B8E9B",
  armchair: "#7B9EA8",
  coffee_table: "#DEB887",
  tv_stand: "#708090",
  bookshelf: "#CD853F",
  desk: "#D2B48C",
  chair: "#778899",
  dining_table: "#DEB887",
  dining_chair: "#D2B48C",
  plant: "#6B8E23",
  lamp: "#FFD700",
  rug: "#BC8F8F",
}

interface FurnitureMeshProps {
  item: FurnitureInstance
}

// Component For Download 3D Model
function GLTFModel({ 
  url, 
  targetDimensions,
  isSelected,
  onClick 
}: { 
  url: string
  targetDimensions: { width: number; height: number; depth: number }
  isSelected: boolean
  onClick: () => void 
}) {
  const { scene } = useGLTF(url)
  
  // Clone scene, center it, and calculate scale all in one pass
  const { clonedScene, scale } = useMemo(() => {
    const clone = scene.clone(true)
    
    // Clone materials for each mesh to ensure independence
    clone.traverse((child: Object3D) => {
      if ('material' in child && child.material) {
        const meshChild = child as { material: Material | Material[] }
        if (Array.isArray(meshChild.material)) {
          meshChild.material = meshChild.material.map((m) => m.clone())
        } else {
          meshChild.material = meshChild.material.clone()
        }
      }
    })
    
    
    // Compute bounding box of the original model
    const box = new Box3().setFromObject(clone)
    const size = new Vector3()
    box.getSize(size)
    const center = new Vector3()
    box.getCenter(center)
    
    // Debug log to check model size
    console.log(`[GLTFModel] ${url} - Original size:`, {
      x: size.x.toFixed(3),
      y: size.y.toFixed(3),
      z: size.z.toFixed(3)
    }, 'Target dimensions:', targetDimensions, 'Center:', {
      x: center.x.toFixed(3),
      y: center.y.toFixed(3),
      z: center.z.toFixed(3)
    }, 'Box min:', {
      x: box.min.x.toFixed(3),
      y: box.min.y.toFixed(3),
      z: box.min.z.toFixed(3)
    }, 'Box max:', {
      x: box.max.x.toFixed(3),
      y: box.max.y.toFixed(3),
      z: box.max.z.toFixed(3)
    })
    
    // Calculate scale factors for each axis to fit the target dimensions
    // Note: In Three.js, X=width, Y=height, Z=depth
    // Clamp scale to reasonable values to prevent model from disappearing
    const maxScale = 100
    const minScale = 0.01
    const scaleX = size.x > 0.001 ? Math.min(Math.max(targetDimensions.width / size.x, minScale), maxScale) : 1
    const scaleY = size.y > 0.001 ? Math.min(Math.max(targetDimensions.height / size.y, minScale), maxScale) : 1
    const scaleZ = size.z > 0.001 ? Math.min(Math.max(targetDimensions.depth / size.z, minScale), maxScale) : 1
    
    console.log(`[GLTFModel] ${url} - Calculated scale:`, {
      x: scaleX.toFixed(3),
      y: scaleY.toFixed(3),
      z: scaleZ.toFixed(3)
    })
    
    // Position the model centered at origin (0,0,0) in local space
    // Multiply by scale because when the primitive is scaled,
    // the position is NOT scaled, but the geometry IS scaled.
    // Without this, models with non-uniform scale or scale != 1 will be offset.
    clone.position.x = -center.x * scaleX
    clone.position.y = -center.y * scaleY
    clone.position.z = -center.z * scaleZ
    
    console.log(`[GLTFModel] ${url} - Model positioned at:`, {
      x: clone.position.x.toFixed(3),
      y: clone.position.y.toFixed(3),
      z: clone.position.z.toFixed(3)
    })
    
    return { 
      clonedScene: clone, 
      scale: { x: scaleX, y: scaleY, z: scaleZ } 
    }
  }, [scene, targetDimensions, url])
  
  // Apply or remove selection highlight to all meshes
  useEffect(() => {
    clonedScene.traverse((child: Object3D) => {
      if ('material' in child && child.material) {
        const meshChild = child as { material: { emissive?: { setHex: (hex: number) => void } } }
        if (meshChild.material.emissive) {
          meshChild.material.emissive.setHex(isSelected ? 0xf89d2a : 0x000000)
        }
      }
    })
  }, [clonedScene, isSelected])
  
  return (
    <primitive 
      object={clonedScene} 
      scale={[scale.x, scale.y, scale.z]}
      onClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation()
        onClick()
      }}
    />
  )
}

// Fallback box while loading
function FallbackBox({ 
  dimensions, 
  color, 
  isSelected 
}: { 
  dimensions: { width: number; height: number; depth: number }
  color: string
  isSelected: boolean 
}) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      <meshStandardMaterial
        color={isSelected ? "#f89d2a" : color}
        transparent={isSelected}
        opacity={isSelected ? 0.85 : 1}
      />
    </mesh>
  )
}

export function FurnitureMesh({ item }: FurnitureMeshProps) {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>(null)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)
  const isGizmoDragging = useEditorStore((s) => s.isGizmoDragging)

  const isSelected = selectedId === item.instanceId
  const color = CATEGORY_COLORS[item.category] || "#999999"

  const edgesGeometry = useMemo(() => {
    const box = new BoxGeometry(
      item.dimensions.width * 1.01,
      item.dimensions.height * 1.01,
      item.dimensions.depth * 1.01
    )
    return box
  }, [item.dimensions.width, item.dimensions.height, item.dimensions.depth])

  const rawRot = item.rotation ?? 0
  const offset = item.model_rotation_offset ?? 0
  const targetRadY = ((rawRot + offset) * Math.PI) / 180
  const targetY = item.dimensions.height / 2 + item.pos_y

  // Snap to the target on first mount so new furniture doesn't slide in
  // from (0,0,0). Subsequent changes animate via useFrame below.
  useEffect(() => {
    const g = groupRef.current
    if (!g) return
    g.position.set(item.pos_x, targetY, item.pos_z)
    g.rotation.y = targetRadY
    // Intentionally only on first mount — target is kept in `item` props
    // and read live inside useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    // While the user is dragging via gizmo, snap — the gizmo's own handler
    // updates item.pos_x/pos_z every pointer move, and interpolating would
    // feel laggy.
    if (isGizmoDragging && isSelected) {
      g.position.set(item.pos_x, targetY, item.pos_z)
      g.rotation.y = targetRadY
      return
    }
    const dx = item.pos_x - g.position.x
    const dy = targetY - g.position.y
    const dz = item.pos_z - g.position.z
    const far = Math.abs(dx) + Math.abs(dy) + Math.abs(dz) > ANIM_MAX_DISTANCE
    if (far) {
      g.position.set(item.pos_x, targetY, item.pos_z)
    } else if (
      Math.abs(dx) > ANIM_SNAP_EPSILON ||
      Math.abs(dy) > ANIM_SNAP_EPSILON ||
      Math.abs(dz) > ANIM_SNAP_EPSILON
    ) {
      g.position.x += dx * ANIM_LERP_FACTOR
      g.position.y += dy * ANIM_LERP_FACTOR
      g.position.z += dz * ANIM_LERP_FACTOR
    } else {
      g.position.set(item.pos_x, targetY, item.pos_z)
    }
    const dr = shortestAngleDelta(g.rotation.y, targetRadY)
    if (Math.abs(dr) > ANIM_SNAP_EPSILON) {
      g.rotation.y += dr * ANIM_LERP_FACTOR
    } else {
      g.rotation.y = targetRadY
    }
  })

  return (
    <group ref={groupRef}>
      {item.model_url ? (
        // Render 3D Model if model_url exists
        <Suspense fallback={
          <FallbackBox dimensions={item.dimensions} color={color} isSelected={isSelected} />
        }>
          <GLTFModel 
            url={item.model_url} 
            targetDimensions={item.dimensions}
            isSelected={isSelected}
            onClick={() => setSelectedId(item.instanceId)}
          />
        </Suspense>
      ) : (
        // Fallback to box geometry
        <mesh
          ref={meshRef}
          castShadow
          receiveShadow
          onClick={(e) => {
            e.stopPropagation()
            setSelectedId(item.instanceId)
          }}
        >
          <boxGeometry
            args={[
              item.dimensions.width,
              item.dimensions.height,
              item.dimensions.depth,
            ]}
          />
          <meshStandardMaterial
            color={isSelected ? "#f89d2a" : color}
            transparent={isSelected}
            opacity={isSelected ? 0.85 : 1}
          />
        </mesh>
      )}

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[edgesGeometry]} />
          <lineBasicMaterial color="#f89d2a" />
        </lineSegments>
      )}
      {/* <FrontArrow height={item.dimensions.height} /> */}

      {/* Feng Shui Alert - only shown for selected item */}
      {isSelected && <FengShuiAlert item={item} />}
    </group>
  )
}

// Selecting any furniture shows the consumer-friendly disc+ring gizmo:
// drag the disc to move (floor plane, snap 10 cm) or drag the outer ring
// to rotate (yaw only, snap 15°). Hold Shift for free / non-snapped drag.
export function FurnitureMeshWithGizmo({ item }: FurnitureMeshProps) {
  const selectedId = useEditorStore((s) => s.selectedId)
  const isSelected = selectedId === item.instanceId

  return (
    <>
      <FurnitureMesh item={item} />
      {isSelected && <FurnitureGizmo item={item} />}
    </>
  )
}




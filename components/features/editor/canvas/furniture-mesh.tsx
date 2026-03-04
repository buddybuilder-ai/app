"use client"

import { useRef, useMemo, useEffect, Suspense } from "react"
import { BoxGeometry, Box3, Vector3, type Mesh, type Object3D, type Material } from "three"
import { useGLTF } from "@react-three/drei"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance } from "@/types/editor"
import { TransformGizmo } from "./transform-gizmo"
import { RotationGizmo } from "./rotation-gizmo"

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
  const meshRef = useRef<Mesh>(null)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)

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

  return (
    <group
      position={[
        item.pos_x,
        item.dimensions.height / 2 + item.pos_y,
        item.pos_z,
      ]}
      rotation={[0, ((item.rotation + (item.model_rotation_offset ?? 0)) * Math.PI) / 180, 0]}
    >
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
    </group>
  )
}

// Component that renders furniture with gizmo when selected in move/rotate mode
export function FurnitureMeshWithGizmo({ item }: FurnitureMeshProps) {
  const selectedId = useEditorStore((s) => s.selectedId)
  const activeTool = useEditorStore((s) => s.activeTool)
  const isSelected = selectedId === item.instanceId
  const isMoveMode = activeTool === "move"
  const isRotateMode = activeTool === "rotate"

  return (
    <>
      <FurnitureMesh item={item} />
      {isSelected && isMoveMode && <TransformGizmo item={item} />}
      {isSelected && isRotateMode && <RotationGizmo item={item} />}
    </>
  )
}




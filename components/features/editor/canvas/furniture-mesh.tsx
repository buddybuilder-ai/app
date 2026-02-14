"use client"

import { useRef, useMemo } from "react"
import { BoxGeometry, type Mesh } from "three"
import { useEditorStore } from "@/stores/editor-store"
import type { FurnitureInstance } from "@/types/editor"

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
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
    >
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

      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[edgesGeometry]} />
          <lineBasicMaterial color="#f89d2a" />
        </lineSegments>
      )}
    </group>
  )
}

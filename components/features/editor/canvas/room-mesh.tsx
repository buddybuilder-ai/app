"use client"

import { useEditorStore } from "@/stores/editor-store"

export function RoomMesh() {
  const room = useEditorStore((s) => s.room)

  const halfW = room.width / 2
  const halfD = room.depth / 2
  const wallHeight = room.height
  const wallThickness = 0.05

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[room.width, room.depth]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Back wall (North) */}
      <mesh position={[0, wallHeight / 2, -halfD]} receiveShadow>
        <boxGeometry args={[room.width, wallHeight, wallThickness]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>

      {/* Left wall (West) */}
      <mesh position={[-halfW, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, room.depth]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>

      {/* Right wall (East) */}
      <mesh position={[halfW, wallHeight / 2, 0]} receiveShadow>
        <boxGeometry args={[wallThickness, wallHeight, room.depth]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </group>
  )
}

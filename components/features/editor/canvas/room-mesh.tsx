"use client"

import { useMemo } from "react"
import { Html } from "@react-three/drei"
import { useEditorStore } from "@/stores/editor-store"
import { STUDIO_ZONES } from "@/lib/constants"
import type { ZoneDefinition } from "@/types/editor"

type WallSide = "north" | "south" | "east" | "west"

interface DoorConfig {
  wall: WallSide
  offset: number
  width: number
  swing_inward: boolean
}

interface WindowConfig {
  wall: WallSide
  offset: number
  width: number
  height: number
  sill_height: number
}

interface WallSegment {
  start: number
  end: number
}

interface Opening {
  start: number
  end: number
  type: "door" | "window"
  sill_height?: number
  height?: number
}

function getWallLength(
  wall: WallSide,
  roomWidth: number,
  roomDepth: number
): number {
  return wall === "north" || wall === "south" ? roomWidth : roomDepth
}

function computeWallSegments(
  wallLength: number,
  openings: Opening[]
): WallSegment[] {
  const sorted = [...openings].sort((a, b) => a.start - b.start)
  const segments: WallSegment[] = []
  let cursor = 0

  for (const op of sorted) {
    if (op.start > cursor) {
      segments.push({ start: cursor, end: op.start })
    }
    cursor = op.end
  }
  if (cursor < wallLength) {
    segments.push({ start: cursor, end: wallLength })
  }
  return segments
}

function WallWithOpenings({
  wallSide,
  roomWidth,
  roomDepth,
  wallHeight,
  wallThickness,
  doors,
  windows,
}: {
  wallSide: WallSide
  roomWidth: number
  roomDepth: number
  wallHeight: number
  wallThickness: number
  doors: DoorConfig[]
  windows: WindowConfig[]
}) {
  const wallLength = getWallLength(wallSide, roomWidth, roomDepth)
  const halfW = roomWidth / 2
  const halfD = roomDepth / 2

  const wallDoors = doors.filter((d) => d.wall === wallSide)
  const wallWindows = windows.filter((w) => w.wall === wallSide)

  const openings: Opening[] = [
    ...wallDoors.map((d) => ({
      start: d.offset,
      end: d.offset + d.width,
      type: "door" as const,
    })),
    ...wallWindows.map((w) => ({
      start: w.offset,
      end: w.offset + w.width,
      type: "window" as const,
      sill_height: w.sill_height,
      height: w.height,
    })),
  ]

  const segments = computeWallSegments(wallLength, openings)

  // Wall color
  const color = wallSide === "north" ? "#fafafa" : "#f0f0f0"

  // Compute position and rotation based on wall side
  function getSegmentTransform(seg: WallSegment) {
    const segWidth = seg.end - seg.start
    const segCenter = seg.start + segWidth / 2

    switch (wallSide) {
      case "north":
        return {
          position: [segCenter - halfW, wallHeight / 2, -halfD] as [
            number,
            number,
            number,
          ],
          size: [segWidth, wallHeight, wallThickness] as [
            number,
            number,
            number,
          ],
        }
      case "south":
        return {
          position: [segCenter - halfW, wallHeight / 2, halfD] as [
            number,
            number,
            number,
          ],
          size: [segWidth, wallHeight, wallThickness] as [
            number,
            number,
            number,
          ],
        }
      case "west":
        return {
          position: [-halfW, wallHeight / 2, segCenter - halfD] as [
            number,
            number,
            number,
          ],
          size: [wallThickness, wallHeight, segWidth] as [
            number,
            number,
            number,
          ],
        }
      case "east":
        return {
          position: [halfW, wallHeight / 2, segCenter - halfD] as [
            number,
            number,
            number,
          ],
          size: [wallThickness, wallHeight, segWidth] as [
            number,
            number,
            number,
          ],
        }
    }
  }

  function getWindowTransform(win: WindowConfig) {
    const winCenter = win.offset + win.width / 2
    const winY = win.sill_height + win.height / 2

    switch (wallSide) {
      case "north":
        return {
          position: [winCenter - halfW, winY, -halfD] as [
            number,
            number,
            number,
          ],
          size: [win.width, win.height, 0.02] as [number, number, number],
        }
      case "south":
        return {
          position: [winCenter - halfW, winY, halfD] as [
            number,
            number,
            number,
          ],
          size: [win.width, win.height, 0.02] as [number, number, number],
        }
      case "west":
        return {
          position: [-halfW, winY, winCenter - halfD] as [
            number,
            number,
            number,
          ],
          size: [0.02, win.height, win.width] as [number, number, number],
        }
      case "east":
        return {
          position: [halfW, winY, winCenter - halfD] as [
            number,
            number,
            number,
          ],
          size: [0.02, win.height, win.width] as [number, number, number],
        }
    }
  }

  // For walls with windows, render the wall above and below the window
  function getWindowWallSegments(win: WindowConfig) {
    const winCenter = win.offset + win.width / 2
    const results: { position: [number, number, number]; size: [number, number, number] }[] = []

    // Below window (sill)
    if (win.sill_height > 0) {
      const belowH = win.sill_height
      switch (wallSide) {
        case "north":
          results.push({
            position: [winCenter - halfW, belowH / 2, -halfD],
            size: [win.width, belowH, wallThickness],
          })
          break
        case "south":
          results.push({
            position: [winCenter - halfW, belowH / 2, halfD],
            size: [win.width, belowH, wallThickness],
          })
          break
        case "west":
          results.push({
            position: [-halfW, belowH / 2, winCenter - halfD],
            size: [wallThickness, belowH, win.width],
          })
          break
        case "east":
          results.push({
            position: [halfW, belowH / 2, winCenter - halfD],
            size: [wallThickness, belowH, win.width],
          })
          break
      }
    }

    // Above window
    const topOfWindow = win.sill_height + win.height
    if (topOfWindow < wallHeight) {
      const aboveH = wallHeight - topOfWindow
      const aboveY = topOfWindow + aboveH / 2
      switch (wallSide) {
        case "north":
          results.push({
            position: [winCenter - halfW, aboveY, -halfD],
            size: [win.width, aboveH, wallThickness],
          })
          break
        case "south":
          results.push({
            position: [winCenter - halfW, aboveY, halfD],
            size: [win.width, aboveH, wallThickness],
          })
          break
        case "west":
          results.push({
            position: [-halfW, aboveY, winCenter - halfD],
            size: [wallThickness, aboveH, win.width],
          })
          break
        case "east":
          results.push({
            position: [halfW, aboveY, winCenter - halfD],
            size: [wallThickness, aboveH, win.width],
          })
          break
      }
    }

    return results
  }

  // For door openings, render the lintel above
  function getDoorLintel(door: DoorConfig) {
    const doorHeight = 2.1 // standard door height
    if (doorHeight >= wallHeight) return null
    const lintelH = wallHeight - doorHeight
    const doorCenter = door.offset + door.width / 2

    switch (wallSide) {
      case "north":
        return {
          position: [doorCenter - halfW, doorHeight + lintelH / 2, -halfD] as [number, number, number],
          size: [door.width, lintelH, wallThickness] as [number, number, number],
        }
      case "south":
        return {
          position: [doorCenter - halfW, doorHeight + lintelH / 2, halfD] as [number, number, number],
          size: [door.width, lintelH, wallThickness] as [number, number, number],
        }
      case "west":
        return {
          position: [-halfW, doorHeight + lintelH / 2, doorCenter - halfD] as [number, number, number],
          size: [wallThickness, lintelH, door.width] as [number, number, number],
        }
      case "east":
        return {
          position: [halfW, doorHeight + lintelH / 2, doorCenter - halfD] as [number, number, number],
          size: [wallThickness, lintelH, door.width] as [number, number, number],
        }
    }
  }

  return (
    <group>
      {/* Full-height wall segments (between openings) */}
      {segments.map((seg, i) => {
        const { position, size } = getSegmentTransform(seg)
        return (
          <mesh key={`seg-${i}`} position={position} receiveShadow castShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
          </mesh>
        )
      })}

      {/* Window glass panes */}
      {wallWindows.map((win, i) => {
        const { position, size } = getWindowTransform(win)
        return (
          <mesh key={`win-${i}`} position={position}>
            <boxGeometry args={size} />
            <meshStandardMaterial
              color="#87CEEB"
              transparent
              opacity={0.3}
            />
          </mesh>
        )
      })}

      {/* Wall segments around windows (below sill, above top) */}
      {wallWindows.map((win, i) =>
        getWindowWallSegments(win).map((seg, j) => (
          <mesh
            key={`winseg-${i}-${j}`}
            position={seg.position}
            receiveShadow
            castShadow
          >
            <boxGeometry args={seg.size} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))
      )}

      {/* Lintels above doors */}
      {wallDoors.map((door, i) => {
        const lintel = getDoorLintel(door)
        if (!lintel) return null
        return (
          <mesh
            key={`lintel-${i}`}
            position={lintel.position}
            receiveShadow
            castShadow
          >
            <boxGeometry args={lintel.size} />
            <meshStandardMaterial color={color} />
          </mesh>
        )
      })}

      {/* Door floor markers */}
      {wallDoors.map((door, i) => {
        const doorCenter = door.offset + door.width / 2
        let markerPos: [number, number, number]
        switch (wallSide) {
          case "north":
            markerPos = [doorCenter - halfW, 0.005, -halfD + 0.5]
            break
          case "south":
            markerPos = [doorCenter - halfW, 0.005, halfD - 0.5]
            break
          case "west":
            markerPos = [-halfW + 0.5, 0.005, doorCenter - halfD]
            break
          case "east":
            markerPos = [halfW - 0.5, 0.005, doorCenter - halfD]
            break
        }
        return (
          <mesh
            key={`doormark-${i}`}
            position={markerPos}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.4, 32, 0, Math.PI]} />
            <meshStandardMaterial
              color="#d4a574"
              transparent
              opacity={0.4}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function ZoneOverlay({ zone }: { zone: ZoneDefinition }) {
  const zoneConfig =
    STUDIO_ZONES[zone.type as keyof typeof STUDIO_ZONES]
  if (!zoneConfig) return null

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[zone.x, 0.005, zone.z]}
      >
        <planeGeometry args={[zone.width, zone.depth]} />
        <meshStandardMaterial
          color={zoneConfig.color}
          transparent
          opacity={0.15}
        />
      </mesh>
      <Html position={[zone.x, 0.01, zone.z]} center>
        <span className="pointer-events-none select-none whitespace-nowrap rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
          {zoneConfig.labelTh}
        </span>
      </Html>
    </group>
  )
}

interface RoomMeshProps {
  // Walls in this list are omitted entirely (cutaway view). Useful for the
  // render workspace where a full 4-wall room hides the interior from any
  // front/back/side camera.
  hideWallSides?: WallSide[]
}

export function RoomMesh({ hideWallSides }: RoomMeshProps = {}) {
  const room = useEditorStore((s) => s.room)
  const wallThickness = 0.05

  const doors = useMemo(
    () => (room.doors ?? []) as DoorConfig[],
    [room.doors]
  )
  const windows = useMemo(
    () => (room.windows ?? []) as WindowConfig[],
    [room.windows]
  )
  const zones = useMemo(
    () => (room.zones ?? []) as ZoneDefinition[],
    [room.zones]
  )

  const hidden = new Set(hideWallSides ?? [])
  const walls: WallSide[] = (["north", "south", "east", "west"] as WallSide[]).filter(
    (w) => !hidden.has(w)
  )

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[room.width, room.depth]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Walls with door/window openings */}
      {walls.map((wall) => (
        <WallWithOpenings
          key={wall}
          wallSide={wall}
          roomWidth={room.width}
          roomDepth={room.depth}
          wallHeight={room.height}
          wallThickness={wallThickness}
          doors={doors}
          windows={windows}
        />
      ))}

      {/* Zone overlays */}
      {zones.map((zone) => (
        <ZoneOverlay key={zone.id} zone={zone} />
      ))}
    </group>
  )
}

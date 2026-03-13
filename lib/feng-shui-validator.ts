import type { FurnitureInstance, RoomConfig } from "@/types/editor"

/**
 * Feng Shui validation rule types
 */
export type FengShuiSeverity = "error" | "warning" | "info"

export interface FengShuiViolation {
  rule_id: string
  severity: FengShuiSeverity
  message: string
  description: string
  recommendation: string
}

/**
 * Check if furniture is in command position
 * Command position = not directly in line with the door, with back supported
 */
function checkCommandPosition(
  item: FurnitureInstance,
  room: RoomConfig,
  allItems: FurnitureInstance[]
): FengShuiViolation | null {
  // Get door position
  if (!room.doors || room.doors.length === 0) return null
  const door = room.doors[0]

  // Calculate door position in room coordinates
  let doorX = 0
  let doorZ = 0
  const doorOffset = door.offset
  const doorWidth = door.width

  switch (door.wall) {
    case "north":
      doorX = -room.width / 2 + doorOffset
      doorZ = -room.depth / 2
      break
    case "south":
      doorX = -room.width / 2 + doorOffset
      doorZ = room.depth / 2
      break
    case "east":
      doorX = room.width / 2
      doorZ = -room.depth / 2 + doorOffset
      break
    case "west":
      doorX = -room.width / 2
      doorZ = -room.depth / 2 + doorOffset
      break
  }

  // Check if bed or desk is in line with door
  const isBedOrDesk = item.category === "bed" || item.category === "desk"

  if (isBedOrDesk) {
    // Calculate if item is directly in line with door
    const itemX = item.pos_x
    const itemZ = item.pos_z

    // Check if item is in the "death line" - directly in line with door
    const inLineWithDoor =
      (door.wall === "north" || door.wall === "south") &&
      Math.abs(itemX - doorX) < item.dimensions.width / 2 + 0.3

    if (inLineWithDoor) {
      return {
        rule_id: "command_position",
        severity: "error",
        message: `${item.name} ไม่อยู่ในตำแหน่ง Command Position`,
        description: "เตียง/โต๊ะทำงานไม่ควรอยู่ในแนวเดียวกับประตูโดยตรง",
        recommendation: "ควรวางในตำแหน่งที่มองเห็นประตูได้แต่ไม่อยู่ในแนวตรง",
      }
    }
  }

  return null
}

/**
 * Check if bed headboard is against a wall
 */
function checkBedAgainstWall(
  item: FurnitureInstance,
  room: RoomConfig
): FengShuiViolation | null {
  if (item.category === "bed") {
    const rotationRad = (item.rotation * Math.PI) / 180
    const halfDepth = item.dimensions.depth / 2

    // Check if back of bed is against a wall
    const backZ = item.pos_z + Math.sin(rotationRad) * halfDepth

    // Find nearest wall
    const walls = [
      { wall: "north", pos: -room.depth / 2 },
      { wall: "south", pos: room.depth / 2 },
    ]

    const nearestWall = walls.reduce((nearest, wall) => {
      const distToWall = Math.abs(backZ - wall.pos)
      const distToNearest = Math.abs(backZ - nearest.pos)
      return distToWall < distToNearest ? wall : nearest
    })

    if (Math.abs(backZ - nearestWall.pos) > 0.3) {
      return {
        rule_id: "bed_against_wall",
        severity: "warning",
        message: `${item.name} ไม่ชิดผนัง`,
        description: "หัวเตียงควรชิดผนังเพื่อสร้างความมั่นคง",
        recommendation: "ควรวางเตียงให้ชิดผนัง",
      }
    }
  }

  return null
}

/**
 * Check for sharp corners pointing at seating areas
 */
function checkSharpCorners(
  item: FurnitureInstance,
  room: RoomConfig,
  allItems: FurnitureInstance[]
): FengShuiViolation | null {
  // Check if desk corner or wardrobe corner points at bed or seating
  const hasSharpCorners = item.category === "desk" || item.category === "wardrobe"

  if (hasSharpCorners) {
    // Find beds or seating in the room
    const beds = allItems.filter((i) => i.category === "bed" || i.category === "sofa")

    for (const bed of beds) {
      const distance = Math.sqrt(
        Math.pow(item.pos_x - bed.pos_x, 2) + Math.pow(item.pos_z - bed.pos_z, 2)
      )

      // If too close and potentially pointing at bed
      if (distance < 2 && distance > 0.5) {
        return {
          rule_id: "sharp_corner_pointing",
          severity: "warning",
          message: `มุมแหลมของ ${item.name} ชี้ไปที่ ${bed.name}`,
          description: "มุมแหลมของเฟอร์นิเจอร์ไม่ควรชี้ไปที่ที่นอนหรือที่นั่ง",
          recommendation: "ควรหมุนเฟอร์นิเจอร์หรือย้ายตำแหน่ง",
        }
      }
    }
  }

  return null
}

/**
 * Check if walkway/chi flow is blocked
 */
function checkChiFlow(
  item: FurnitureInstance,
  room: RoomConfig,
  allItems: FurnitureInstance[]
): FengShuiViolation | null {
  // Check if item blocks the main walkway
  // Main walkway is typically through the center of the room

  const centerX = 0
  const centerZ = 0
  const itemHalfWidth = item.dimensions.width / 2
  const itemHalfDepth = item.dimensions.depth / 2

  // Check if item is in the center path
  const blocksCenter =
    Math.abs(item.pos_x - centerX) < itemHalfWidth + 0.5 &&
    Math.abs(item.pos_z - centerZ) < itemHalfDepth + 0.5

  if (blocksCenter && item.category !== "rug") {
    // Check if there are other items that could be walked around
    const otherItems = allItems.filter((i) => i.instanceId !== item.instanceId)

    if (otherItems.length > 2) {
      return {
        rule_id: "chi_flow_blocked",
        severity: "warning",
        message: `${item.name} อาจบล็อกการไหลเวียนของพลังงาน`,
        description: "เฟอร์นิเจอร์กีดขวางทางเดินกลางห้อง",
        recommendation: "ควรจัดวางให้มีทางเดินรอบๆ",
      }
    }
  }

  return null
}

/**
 * Check desk facing door
 */
function checkDeskFacingDoor(
  item: FurnitureInstance,
  room: RoomConfig
): FengShuiViolation | null {
  if (item.category === "desk") {
    const door = room.doors[0]
    if (!door) return null

    // Calculate desk facing direction (front of desk)
    const rotationRad = (item.rotation * Math.PI) / 180
    const frontZ = item.pos_z + Math.cos(rotationRad) * (item.dimensions.depth / 2)

    let doorZ = 0
    switch (door.wall) {
      case "north":
        doorZ = -room.depth / 2
        break
      case "south":
        doorZ = room.depth / 2
        break
    }

    // If desk front faces the door
    if ((door.wall === "north" && frontZ < item.pos_z) || (door.wall === "south" && frontZ > item.pos_z)) {
      return {
        rule_id: "desk_facing_door",
        severity: "warning",
        message: `${item.name} หันหน้าไปทางประตูโดยตรง`,
        description: "โต๊ะทำงานไม่ควรหันหน้าไปทางประตูโดยตรง",
        recommendation: "ควรหมุนโต๊ะให้หลังชิดผนังและมองเห็นประตู",
      }
    }
  }

  return null
}

/**
 * Main Feng Shui validation function
 */
// function checkNewRule(
//   item: FurnitureInstance,
//   room: RoomConfig,
//   allItems: FurnitureInstance[]
// ): FengShuiViolation | null {
//   // Logic to check new rule
//   if (/* Failing condition */) {
//     return {
//       rule_id: "new_rule_id",
//       severity: "warning", // หรือ "error", "info"
//       message: "Message to show in UI",
//       description: "Description",
//       recommendation: "Recommendation"
//     }
//   }
//   return null
// }

export function validateFengShui(
  item: FurnitureInstance,
  room: RoomConfig,
  allItems: FurnitureInstance[]
): FengShuiViolation[] {
  const violations: FengShuiViolation[] = []

  // Add new rules here
  // const newRuleViolation = checkNewRule(item, room, allItems)
  // if (newRuleViolation) violations.push(newRuleViolation)

  // Check command position
  const commandPosViolation = checkCommandPosition(item, room, allItems)
  if (commandPosViolation) violations.push(commandPosViolation)

  // Check bed against wall
  const wallViolation = checkBedAgainstWall(item, room)
  if (wallViolation) violations.push(wallViolation)

  // Check sharp corners
  const cornerViolation = checkSharpCorners(item, room, allItems)
  if (cornerViolation) violations.push(cornerViolation)

  // Check chi flow
  const chiFlowViolation = checkChiFlow(item, room, allItems)
  if (chiFlowViolation) violations.push(chiFlowViolation)

  // Check desk facing door
  const deskDoorViolation = checkDeskFacingDoor(item, room)
  if (deskDoorViolation) violations.push(deskDoorViolation)

  return violations
}

/**
 * Quick validation - returns just whether there are any violations
 */
export function quickValidateFengShui(
  item: FurnitureInstance,
  room: RoomConfig,
  allItems: FurnitureInstance[]
): { isValid: boolean; violations: FengShuiViolation[] } {
  const violations = validateFengShui(item, room, allItems)
  return {
    isValid: violations.filter((v) => v.severity === "error").length === 0,
    violations,
  }
}

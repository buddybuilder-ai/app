"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Html } from "@react-three/drei"
import type { FurnitureInstance } from "@/types/editor"
import { validateFengShui, type FengShuiViolation } from "@/lib/feng-shui-validator"
import { useEditorStore } from "@/stores/editor-store"

/**
 * Custom debounce hook for delaying value updates
 */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface FengShuiAlertProps {
  item: FurnitureInstance
}

// Severity colors
const SEVERITY_COLORS = {
  error: "#ef4444",    // Red
  warning: "#f59e0b",  // Amber
  info: "#3b82f6",     // Blue
}

const SEVERITY_BG_COLORS = {
  error: "rgba(239, 68, 68, 0.95)",
  warning: "rgba(245, 158, 11, 0.95)",
  info: "rgba(59, 130, 246, 0.95)",
}

export function FengShuiAlert({ item }: FengShuiAlertProps) {
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const room = useEditorStore((s) => s.room)

  // Debounce values to avoid expensive validation on every frame during drag
  const debouncedItem = useDebouncedValue(item, 150)
  const debouncedFurnitureItems = useDebouncedValue(furnitureItems, 150)
  const debouncedRoom = useDebouncedValue(room, 150)

  // Validate feng shui for this item (debounced)
  const violations = useMemo(() => {
    return validateFengShui(debouncedItem, debouncedRoom, debouncedFurnitureItems)
  }, [debouncedItem, debouncedRoom, debouncedFurnitureItems])

  // Don't render if no violations
  if (violations.length === 0) {
    return null
  }

  // Get the most severe violation for the alert
  const primaryViolation = violations.find(v => v.severity === "error") || violations[0]
  const color = SEVERITY_COLORS[primaryViolation.severity]
  const bgColor = SEVERITY_BG_COLORS[primaryViolation.severity]

  // Calculate position above the furniture
  const positionY = item.dimensions.height + 0.3 // Above the furniture

  return (
    <group position={[0, positionY, 0]}>
      <Html
        position={[0, 0, 0]}
        style={{
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div
          style={{
            backgroundColor: bgColor,
            color: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontFamily: "system-ui, -apple-system, sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            whiteSpace: "nowrap",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <span style={{ fontSize: "14px", flexShrink: 0 }}>⚠️</span>
          <span style={{ lineHeight: 1.3 }}>{primaryViolation.message}</span>
          {violations.length > 1 && (
            <span style={{ 
              fontSize: "10px", 
              opacity: 0.9,
              marginLeft: "6px",
              paddingLeft: "6px",
              borderLeft: "1px solid rgba(255,255,255,0.3)"
            }}>
              +{violations.length - 1}
            </span>
          )}
        </div>
      </Html>
      
      {/* Warning indicator sphere */}
      <mesh position={[item.dimensions.width / 2 + 0.1, -item.dimensions.height / 2, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

// Component to show detailed violation list
export function FengShuiDetailPanel({ violations }: { violations: FengShuiViolation[] }) {
  if (violations.length === 0) {
    return null
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      padding: "12px",
      backgroundColor: "rgba(255,255,255,0.95)",
      borderRadius: "8px",
      maxHeight: "200px",
      overflowY: "auto",
    }}>
      {violations.map((violation, index) => (
        <div
          key={`${violation.rule_id}-${index}`}
          style={{
            padding: "8px",
            borderRadius: "6px",
            backgroundColor: SEVERITY_BG_COLORS[violation.severity],
            color: "white",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
            {violation.message}
          </div>
          <div style={{ opacity: 0.9, fontSize: "11px" }}>
            {violation.recommendation}
          </div>
        </div>
      ))}
    </div>
  )
}

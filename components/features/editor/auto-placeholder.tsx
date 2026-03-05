"use client"

import { useEffect } from "react"
import { useEditorStore } from "@/stores/editor-store"
import { FURNITURE_CATALOG } from "@/lib/furniture-catalog"

export function AutoPlaceholder() {
  const addFurniture = useEditorStore((s) => s.addFurniture)
  const roomItems = useEditorStore((s) => s.room.items)

  useEffect(() => {
    // ป้องกันการแอดของซ้ำ ถ้ามีของในห้องอยู่แล้วจะไม่ทำอะไร
    if (roomItems && roomItems.length > 0) return

    const backendMockup = {
      "status": "success",
      "room_summary": { "scale_factor": 2.04 },
      "objects": [
        {
            "label": "dining_chair",
            "confidence": 0.66,
            "width_m": 0.8,
            "height_m": 1.1,
            "elevation_m": 0.0,
            "distance_m": 1.25,
            "center_pixel": [
                912,
                394
            ]
        },
        {
            "label": "dining_chair",
            "confidence": 0.49,
            "width_m": 0.8,
            "height_m": 1.1,
            "elevation_m": 0.0,
            "distance_m": 1.25,
            "center_pixel": [
                964,
                323
            ]
        }
      ]
    }

    if (backendMockup.status === "success") {
      backendMockup.objects.forEach((obj) => {
        // หาข้อมูล Model จาก Catalog
        const catalogItem = FURNITURE_CATALOG.find(
          (item) => item.category === obj.label || item.id.includes(obj.label)
        )

        addFurniture({
          id: catalogItem?.id || `auto-${obj.label}`,
          instanceId: `${obj.label}-${Date.now()}-${Math.random()}`,
          name: catalogItem?.name || obj.label,
          category: catalogItem?.category || obj.label,
          // คำนวณตำแหน่ง X จาก Pixel
          pos_x: (obj.center_pixel[0] / 100) * backendMockup.room_summary.scale_factor - 2, // -2 เพื่อให้อยู่กลางจอ (ปรับตามขนาดห้อง)
          pos_y: obj.elevation_m,
          pos_z: obj.distance_m,
          rotation: 0,
          dimensions: {
            width: obj.width_m,
            depth: catalogItem?.dimensions.depth || 0.6,
            height: obj.height_m,
          },
          model_url: catalogItem?.model_url,
          is_essential: catalogItem?.is_essential || false,
          feng_shui_notes: []
        })
      })
    }
  }, [addFurniture, roomItems])

  return null // ไม่ต้องแสดง UI อะไร
}
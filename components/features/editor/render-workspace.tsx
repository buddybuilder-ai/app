"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, Download, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { useProject } from "@/hooks/use-project"
import { useEditorStore } from "@/stores/editor-store"
import {
  RenderSceneCanvas,
  type CameraPreset,
} from "./canvas/render-scene-canvas"

const PRESETS: { id: CameraPreset; label: string }[] = [
  { id: "isometric", label: "มุมมองรวม" },
  { id: "front", label: "หน้าห้อง" },
  { id: "back", label: "หลังห้อง" },
  { id: "left", label: "ด้านซ้าย" },
  { id: "right", label: "ด้านขวา" },
  { id: "top", label: "มุมสูง (ผังพื้น)" },
]

function captureCanvas(): string | null {
  const canvas = document.querySelector<HTMLCanvasElement>(
    "[data-render-canvas] canvas"
  )
  if (!canvas) return null
  try {
    return canvas.toDataURL("image/png")
  } catch {
    return null
  }
}

interface RenderWorkspaceProps {
  projectId: string
}

export function RenderWorkspace({ projectId }: RenderWorkspaceProps) {
  const { load } = useProject(projectId)
  const room = useEditorStore((s) => s.room)
  const furnitureItems = useEditorStore((s) => s.furnitureItems)
  const [preset, setPreset] = useState<CameraPreset>("isometric")
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    load().finally(() => setLoaded(true))
  }, [load])

  const handleGenerate = useCallback(async () => {
    if (generating) return
    // Give the scene a frame to render at the new preset before capturing.
    await new Promise((r) => requestAnimationFrame(() => r(null)))
    const dataUrl = captureCanvas()
    if (!dataUrl) {
      toast.error("ยังจับภาพ 3D ไม่ได้ ลองรอให้โหลดเสร็จก่อน")
      return
    }
    const imageBase64 = dataUrl.split(",")[1]
    setGenerating(true)
    setResult(null)
    try {
      const activePreset = PRESETS.find((p) => p.id === preset)?.label ?? preset
      const resp = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64,
          camera_label: activePreset,
          room_direction: room.direction ?? "north",
          door_wall: room.doors?.[0]?.wall ?? "south",
          time_of_day: "midday",
        }),
      })
      if (!resp.ok) {
        const text = await resp.text().catch(() => "Render failed")
        throw new Error(text)
      }
      const data = (await resp.json()) as { image_base64: string; mime_type: string }
      setResult(`data:${data.mime_type};base64,${data.image_base64}`)
      toast.success("สร้างภาพสำเร็จ")
    } catch (err) {
      toast.error(err instanceof Error ? err.message.slice(0, 120) : "เกิดข้อผิดพลาด")
    } finally {
      setGenerating(false)
    }
  }, [generating, preset, room])

  const handleDownload = useCallback(() => {
    if (!result) return
    const a = document.createElement("a")
    a.href = result
    a.download = `render-${preset}-${Date.now()}.png`
    a.click()
  }, [result, preset])

  const hasFurniture = furnitureItems.length > 0

  return (
    <div className="relative flex h-full w-full flex-col">
      <header className="flex h-12 items-center gap-2 border-b bg-background px-4">
        <Link href={`/editor/${projectId}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            กลับไปแก้ไข
          </Button>
        </Link>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <h1 className="text-sm font-semibold">ส่งออกเป็นภาพเสมือนจริง</h1>
        <div className="flex-1" />
        {result && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            ดาวน์โหลด
          </Button>
        )}
        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={handleGenerate}
          disabled={generating || !hasFurniture || !loaded}
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              กำลังสร้างภาพ...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              สร้างภาพ
            </>
          )}
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left: camera preset list */}
        <aside className="flex w-48 shrink-0 flex-col gap-1 border-r bg-muted/30 p-3">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            มุมกล้อง
          </p>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPreset(p.id)}
              className={`rounded-md px-3 py-2 text-left text-sm transition-colors ${
                preset === p.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </aside>

        {/* Right: preview area */}
        <div className="relative min-w-0 flex-1">
          {!loaded ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : !hasFurniture ? (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
              ยังไม่มีเฟอร์นิเจอร์ในห้อง กลับไปเพิ่มก่อนแล้วค่อยส่งออกเป็นภาพนะครับ
            </div>
          ) : (
            <div className="relative grid h-full grid-cols-1 lg:grid-cols-2">
              {/* Live 3D preview of the chosen angle */}
              <div className="relative border-b lg:border-b-0 lg:border-r">
                <div className="absolute left-3 top-3 z-10 rounded bg-background/90 px-2 py-1 text-xs shadow">
                  3D Preview
                </div>
                <RenderSceneCanvas preset={preset} />
              </div>

              {/* Generated photoreal result */}
              <div className="relative flex items-center justify-center bg-muted/40 p-4">
                {generating ? (
                  <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    กำลังสร้างภาพเสมือนจริง (30–60 วินาที)
                  </div>
                ) : result ? (
                  // Using a plain img tag keeps the base64 payload simple and
                  // avoids Next/Image optimisation overhead for one-off renders.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result}
                    alt="Photoreal render"
                    className="max-h-full max-w-full rounded-md shadow-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
                    <Sparkles className="h-6 w-6" />
                    เลือกมุมที่ต้องการแล้วกด “สร้างภาพ” เพื่อสร้างภาพเสมือนจริง
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

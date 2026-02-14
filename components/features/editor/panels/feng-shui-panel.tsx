"use client"

import { X, Compass, AlertTriangle, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useEditorStore } from "@/stores/editor-store"
import { useUIStore } from "@/stores/ui-store"

const SCORE_CATEGORIES = [
  { key: "command_position" as const, label: "Command Position", max: 30 },
  { key: "five_elements_balance" as const, label: "Five Elements", max: 20 },
  { key: "chi_flow" as const, label: "Chi Flow", max: 25 },
  { key: "sha_chi_avoidance" as const, label: "Sha Chi Avoidance", max: 25 },
]

function ScoreBar({
  value,
  max,
  label,
}: {
  value: number
  max: number
  label: string
}) {
  const pct = Math.round((value / max) * 100)
  const color =
    pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className={`h-1.5 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function FengShuiPanel() {
  const isOpen = useUIStore((s) => s.fengShuiPanelOpen)
  const toggle = useUIStore((s) => s.toggleFengShuiPanel)
  const fengShuiScore = useEditorStore((s) => s.fengShuiScore)

  if (!isOpen) return null

  const totalScore = fengShuiScore
    ? fengShuiScore.command_position +
      fengShuiScore.five_elements_balance +
      fengShuiScore.chi_flow +
      fengShuiScore.sha_chi_avoidance
    : 0

  const totalPct = Math.round((totalScore / 100) * 100)
  const gradeColor =
    totalPct >= 80
      ? "text-green-600"
      : totalPct >= 60
        ? "text-yellow-600"
        : "text-red-600"

  return (
    <div className="fixed right-0 top-12 bottom-0 z-20 flex w-80 flex-col border-l bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Feng Shui Score</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={toggle}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {!fengShuiScore ? (
            <div className="py-12 text-center">
              <Compass className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                Generate a layout to see Feng Shui analysis
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Total Score Donut */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${totalPct * 2.64} ${264 - totalPct * 2.64}`}
                      strokeLinecap="round"
                      className={gradeColor}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className={`text-2xl font-bold ${gradeColor}`}>
                      {totalScore}
                    </span>
                    <p className="text-xs text-muted-foreground">/100</p>
                  </div>
                </div>
                <Badge
                  variant={totalPct >= 60 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {totalPct >= 80
                    ? "Excellent"
                    : totalPct >= 60
                      ? "Good"
                      : totalPct >= 40
                        ? "Needs Work"
                        : "Poor"}
                </Badge>
              </div>

              <Separator />

              {/* Breakdown */}
              <div>
                <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Score Breakdown
                </h3>
                <div className="space-y-3">
                  {SCORE_CATEGORIES.map((cat) => (
                    <ScoreBar
                      key={cat.key}
                      value={fengShuiScore[cat.key]}
                      max={cat.max}
                      label={cat.label}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Placeholder for recommendations */}
              <div>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5" />
                  Tips
                </h3>
                <p className="text-xs text-muted-foreground">
                  Detailed recommendations will appear here after analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

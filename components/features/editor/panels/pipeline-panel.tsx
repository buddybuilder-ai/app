"use client"

import { usePipelineStore } from "@/stores/pipeline-store"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Circle,
  Loader2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"
import type { PipelineStepState, ConflictData, RepairActionData } from "@/types/pipeline"

/**
 * Pipeline Progress Panel — shows real-time 5-step pipeline progress.
 * Displayed in the editor when layout generation is running or complete.
 */
export function PipelinePanel() {
  const isRunning = usePipelineStore((s) => s.isRunning)
  const steps = usePipelineStore((s) => s.steps)
  const conflicts = usePipelineStore((s) => s.conflicts)
  const repairActions = usePipelineStore((s) => s.repairActions)
  const explanation = usePipelineStore((s) => s.explanation)
  const fengShuiScore = usePipelineStore((s) => s.fengShuiScore)
  const totalDurationMs = usePipelineStore((s) => s.totalDurationMs)
  const error = usePipelineStore((s) => s.error)

  const hasActivity = isRunning || steps.some((s) => s.status !== "pending")

  if (!hasActivity) return null

  return (
    <div className="absolute bottom-4 left-4 z-20 w-80 max-h-[60vh] overflow-y-auto rounded-lg border bg-background/95 backdrop-blur shadow-lg">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-2.5">
        <h3 className="text-sm font-semibold">
          {isRunning ? "กำลังสร้าง Layout..." : "สร้าง Layout เสร็จแล้ว"}
        </h3>
        {totalDurationMs > 0 && (
          <span className="text-xs text-muted-foreground">
            {(totalDurationMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      <div className="p-3 space-y-1">
        {/* Step list */}
        {steps.map((step, i) => (
          <StepRow key={step.id} step={step} index={i + 1} />
        ))}

        {/* Error */}
        {error && (
          <div className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Conflicts section */}
        {conflicts.length > 0 && (
          <CollapsibleSection
            title={`ปัญหาที่พบ (${conflicts.length})`}
            defaultOpen={false}
          >
            {conflicts.map((c) => (
              <ConflictRow key={c.id} conflict={c} />
            ))}
          </CollapsibleSection>
        )}

        {/* Repairs section */}
        {repairActions.length > 0 && (
          <CollapsibleSection
            title={`การแก้ไข (${repairActions.length})`}
            defaultOpen={false}
          >
            {repairActions.map((r) => (
              <RepairRow key={r.id} action={r} />
            ))}
          </CollapsibleSection>
        )}

        {/* Feng Shui Score */}
        {fengShuiScore && !isRunning && (
          <div className="mt-2 rounded bg-muted/50 p-2">
            <div className="text-xs font-medium mb-1">
              Feng Shui Score:{" "}
              <span className="font-bold">
                {Object.values(fengShuiScore).reduce((a, b) => a + b, 0)}/100
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
              <span>Command: {fengShuiScore.command_position}/30</span>
              <span>Elements: {fengShuiScore.five_elements_balance}/20</span>
              <span>Chi Flow: {fengShuiScore.chi_flow}/25</span>
              <span>Sha Chi: {fengShuiScore.sha_chi_avoidance}/25</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StepRow({ step, index }: { step: PipelineStepState; index: number }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <StepIcon status={step.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span
            className={cn(
              "text-xs font-medium",
              step.status === "running" && "text-primary",
              step.status === "completed" && "text-muted-foreground",
              step.status === "failed" && "text-destructive"
            )}
          >
            {index}. {step.label}
          </span>
        </div>
        {step.message && step.status === "running" && (
          <p className="text-xs text-muted-foreground truncate">{step.message}</p>
        )}
        {step.status === "running" && step.progress > 0 && (
          <div className="mt-0.5 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${step.progress * 100}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

function StepIcon({ status }: { status: PipelineStepState["status"] }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
    case "running":
      return <Loader2 className="h-4 w-4 shrink-0 text-primary animate-spin" />
    case "failed":
      return <XCircle className="h-4 w-4 shrink-0 text-destructive" />
    default:
      return <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
  }
}

function ConflictRow({ conflict }: { conflict: ConflictData }) {
  return (
    <div className="flex items-start gap-1.5 py-0.5">
      {conflict.severity === "critical" ? (
        <XCircle className="h-3 w-3 shrink-0 text-destructive mt-0.5" />
      ) : (
        <AlertTriangle className="h-3 w-3 shrink-0 text-yellow-500 mt-0.5" />
      )}
      <div className="text-xs">
        <p className={cn(conflict.resolved && "line-through text-muted-foreground")}>
          {conflict.description}
        </p>
        {conflict.suggestion && !conflict.resolved && (
          <p className="text-muted-foreground">{conflict.suggestion}</p>
        )}
      </div>
    </div>
  )
}

function RepairRow({ action }: { action: RepairActionData }) {
  return (
    <div className="flex items-start gap-1.5 py-0.5">
      {action.success ? (
        <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500 mt-0.5" />
      ) : (
        <XCircle className="h-3 w-3 shrink-0 text-destructive mt-0.5" />
      )}
      <span className="text-xs">{action.description}</span>
    </div>
  )
}

function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string
  defaultOpen: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mt-2 rounded border">
      <button
        className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-medium hover:bg-muted/50"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {open && <div className="border-t px-2 py-1">{children}</div>}
    </div>
  )
}

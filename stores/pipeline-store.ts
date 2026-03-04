import { create } from "zustand"
import type {
  PipelineStepId,
  PipelineStepState,
  ConflictData,
  RepairActionData,
  LayoutItem,
  PipelineCompletedData,
} from "@/types/pipeline"
import { PIPELINE_STEPS_ORDER, PIPELINE_STEP_LABELS } from "@/types/pipeline"

interface PipelineState {
  // Pipeline status
  isRunning: boolean
  pipelineId: string | null
  error: string | null

  // Steps
  steps: PipelineStepState[]

  // Data
  layoutItems: LayoutItem[]
  conflicts: ConflictData[]
  repairActions: RepairActionData[]
  explanation: string
  fengShuiScore: {
    command_position: number
    five_elements_balance: number
    chi_flow: number
    sha_chi_avoidance: number
  } | null
  totalDurationMs: number

  // Actions
  startPipeline: (pipelineId: string) => void
  setStepStarted: (stepId: PipelineStepId) => void
  setStepProgress: (stepId: PipelineStepId, message: string, progress: number) => void
  setStepCompleted: (stepId: PipelineStepId, data?: Record<string, unknown>) => void
  setStepFailed: (stepId: PipelineStepId, error: string) => void
  addConflict: (conflict: ConflictData) => void
  addRepairAction: (action: RepairActionData) => void
  setLayoutItems: (items: LayoutItem[]) => void
  completePipeline: (data: PipelineCompletedData) => void
  failPipeline: (error: string) => void
  reset: () => void
}

function createInitialSteps(): PipelineStepState[] {
  return PIPELINE_STEPS_ORDER.map((id) => ({
    id,
    label: PIPELINE_STEP_LABELS[id],
    status: "pending",
    progress: 0,
    message: "",
    data: {},
  }))
}

const initialState = {
  isRunning: false,
  pipelineId: null as string | null,
  error: null as string | null,
  steps: createInitialSteps(),
  layoutItems: [] as LayoutItem[],
  conflicts: [] as ConflictData[],
  repairActions: [] as RepairActionData[],
  explanation: "",
  fengShuiScore: null as PipelineState["fengShuiScore"],
  totalDurationMs: 0,
}

export const usePipelineStore = create<PipelineState>((set) => ({
  ...initialState,

  startPipeline: (pipelineId) =>
    set({
      isRunning: true,
      pipelineId,
      error: null,
      steps: createInitialSteps(),
      layoutItems: [],
      conflicts: [],
      repairActions: [],
      explanation: "",
      fengShuiScore: null,
      totalDurationMs: 0,
    }),

  setStepStarted: (stepId) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, status: "running", progress: 0, message: "" } : s
      ),
    })),

  setStepProgress: (stepId, message, progress) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, message, progress } : s
      ),
    })),

  setStepCompleted: (stepId, data) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId
          ? { ...s, status: "completed", progress: 1, data: data || {} }
          : s
      ),
    })),

  setStepFailed: (stepId, error) =>
    set((state) => ({
      steps: state.steps.map((s) =>
        s.id === stepId
          ? { ...s, status: "failed", message: error }
          : s
      ),
    })),

  addConflict: (conflict) =>
    set((state) => ({
      conflicts: [...state.conflicts, conflict],
    })),

  addRepairAction: (action) =>
    set((state) => ({
      repairActions: [...state.repairActions, action],
    })),

  setLayoutItems: (items) => set({ layoutItems: items }),

  completePipeline: (data) =>
    set({
      isRunning: false,
      layoutItems: data.layout_items,
      fengShuiScore: data.feng_shui_score,
      conflicts: data.conflicts,
      repairActions: data.repair_actions,
      explanation: data.explanation,
      totalDurationMs: data.total_duration_ms,
    }),

  failPipeline: (error) =>
    set({ isRunning: false, error }),

  reset: () => set(initialState),
}))

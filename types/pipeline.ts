/**
 * Types for the 5-Step Agentic Layout Pipeline SSE events.
 */

// Pipeline step identifiers matching backend PipelineStep enum
export type PipelineStepId =
  | "structured_data_builder"
  | "layout_generator"
  | "rule_checker"
  | "repair"
  | "explainer"

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped"

// SSE event types matching backend SSEEventType enum
export type SSEEventType =
  | "pipeline_started"
  | "step_started"
  | "step_progress"
  | "step_completed"
  | "step_failed"
  | "conflict_found"
  | "repair_applied"
  | "layout_updated"
  | "pipeline_completed"
  | "pipeline_failed"
  // Chat stream events
  | "router_classified"
  | "modifier_started"
  | "modifier_updated"
  | "modifier_completed"
  | "mode_changed"
  | "answer"
  | "clarification_needed"

export interface PipelineSSEEvent {
  type: SSEEventType
  [key: string]: unknown
}

export interface ConflictData {
  id: string
  type: string
  severity: "critical" | "warning" | "info"
  description: string
  items_involved: string[]
  suggestion: string
  resolved: boolean
}

export interface RepairActionData {
  id: string
  action_type: "shift" | "rotate" | "swap" | "remove"
  conflict_id: string
  furniture_id: string
  description: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  success: boolean
}

export interface LayoutItem {
  id: string
  furniture_id: string
  name: string
  category: string
  pos_x: number
  pos_y: number
  pos_z: number
  rotation: number
  dimensions: {
    width: number
    depth: number
    height: number
  }
  is_essential: boolean
  feng_shui_notes: string[]
  model_url?: string
  model_rotation_offset?: number
}

export interface StepProgressData {
  step: PipelineStepId
  message: string
  progress: number
}

export interface PipelineStepState {
  id: PipelineStepId
  label: string
  status: StepStatus
  progress: number
  message: string
  data: Record<string, unknown>
}

export interface PipelineCompletedData {
  success: boolean
  pipeline_id: string
  layout_items: LayoutItem[]
  feng_shui_score: {
    command_position: number
    five_elements_balance: number
    chi_flow: number
    sha_chi_avoidance: number
  }
  conflicts: ConflictData[]
  repair_actions: RepairActionData[]
  explanation: string
  total_duration_ms: number
  error: string | null
}

export interface RouterClassifiedData {
  intent: "new_layout" | "modify" | "explain" | "question" | "set_mode"
  confidence: number
  extracted_params: Record<string, unknown>
}

export interface ModifierCompletedData {
  success: boolean
  layout_items: LayoutItem[]
  explanation: string
}

export interface ClarificationQuestion {
  id: string
  question: string
  question_type: "multiple_choice" | "yes_no" | "open_ended" | "numeric"
  priority: "required" | "recommended" | "optional"
  options: string[]
  default_value: string | null
  context: string
  category: string
}

export interface ClarificationNeededData {
  questions: ClarificationQuestion[]
  original_message: string
}

// Labels for each pipeline step (Thai)
export const PIPELINE_STEP_LABELS: Record<PipelineStepId, string> = {
  structured_data_builder: "วิเคราะห์ข้อมูลห้อง",
  layout_generator: "วางผังเฟอร์นิเจอร์",
  rule_checker: "ตรวจสอบกฎ",
  repair: "แก้ไขปัญหา",
  explainer: "สรุปผลลัพธ์",
}

export const PIPELINE_STEPS_ORDER: PipelineStepId[] = [
  "structured_data_builder",
  "layout_generator",
  "rule_checker",
  "repair",
  "explainer",
]

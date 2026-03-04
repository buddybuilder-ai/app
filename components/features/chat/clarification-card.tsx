"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ClarificationQuestion } from "@/types/pipeline"

interface ClarificationCardProps {
  questions: ClarificationQuestion[]
  onSubmit: (answers: Record<string, string>) => void
}

export function ClarificationCard({ questions, onSubmit }: ClarificationCardProps) {
  // Pre-fill defaults
  const initialAnswers = Object.fromEntries(
    questions
      .filter((q) => q.default_value !== null)
      .map((q) => [q.id, q.default_value as string])
  )
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)

  function setAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const requiredIds = questions
    .filter((q) => q.priority === "required")
    .map((q) => q.id)
  const allRequiredAnswered = requiredIds.every(
    (id) => answers[id] && answers[id].trim() !== ""
  )

  function handleSubmit() {
    // Fill missing non-required with defaults
    const final: Record<string, string> = {}
    for (const q of questions) {
      final[q.id] = answers[q.id] ?? q.default_value ?? ""
    }
    onSubmit(final)
  }

  function handleSkip() {
    // Submit all defaults
    const defaults: Record<string, string> = {}
    for (const q of questions) {
      defaults[q.id] = q.default_value ?? ""
    }
    onSubmit(defaults)
  }

  return (
    <div className="rounded-lg border bg-muted/40 p-3 space-y-4 text-sm">
      {questions.map((q) => (
        <div key={q.id} className="space-y-1.5">
          <p className="font-medium text-foreground">
            {q.question}
            {q.priority === "required" && (
              <span className="text-destructive ml-1">*</span>
            )}
          </p>
          {q.context && (
            <p className="text-xs text-muted-foreground">{q.context}</p>
          )}

          {(q.question_type === "multiple_choice") && (
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswer(q.id, opt)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    answers[q.id] === opt
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {q.question_type === "yes_no" && (
            <div className="flex gap-2">
              {(["ใช่", "ไม่ใช่"] as const).map((label) => {
                const val = label === "ใช่" ? "yes" : "no"
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setAnswer(q.id, val)}
                    className={cn(
                      "rounded-full border px-4 py-1 text-xs transition-colors",
                      answers[q.id] === val
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}

          {q.question_type === "open_ended" && (
            <Input
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              placeholder="พิมพ์คำตอบ..."
              className="h-8 text-sm"
            />
          )}

          {q.question_type === "numeric" && (
            <Input
              type="number"
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              placeholder="ตัวเลข..."
              className="h-8 w-28 text-sm"
            />
          )}
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!allRequiredAnswered}
          className="text-xs"
        >
          ยืนยัน
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSkip}
          className="text-xs text-muted-foreground"
        >
          ข้ามไปก่อน
        </Button>
      </div>
    </div>
  )
}

"use client"

import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex h-full min-h-[200px] items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold">เกิดข้อผิดพลาด</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {this.state.error?.message || "เกิดข้อผิดพลาดที่ไม่คาดคิด"}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              ลองอีกครั้ง
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

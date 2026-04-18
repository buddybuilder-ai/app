"use client"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { useAuthStore } from "@/stores/auth-store"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  return (
    <div className="flex h-screen">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <DashboardSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Floating mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="absolute left-3 top-3 z-30 lg:hidden"
          aria-label="เปิดเมนู"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <DashboardSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </div>
  )
}

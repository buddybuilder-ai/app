"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FolderOpen, Settings, PanelLeftClose, PanelLeft, X, MessageCircle, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChatStore } from "@/stores/chat-store"

const navItems = [
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface DashboardSidebarProps {
  onClose?: () => void
}

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const sessions = useChatStore((s) => s.sessions)
  const activeSessionId = useChatStore((s) => s.activeSessionId)
  const newSession = useChatStore((s) => s.newSession)
  const switchSession = useChatStore((s) => s.switchSession)
  const deleteSession = useChatStore((s) => s.deleteSession)

  const isOnChat = pathname.startsWith("/chat")

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo + collapse */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && <Logo />}
        <div className="flex items-center gap-1">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("hidden lg:flex", collapsed && "mx-auto")}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Nav items */}
      <nav className="space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Chat sessions — แสดงเฉพาะเมื่ออยู่หน้า /chat และ sidebar ไม่ได้ย่อ */}
      {isOnChat && !collapsed && (
        <>
          <Separator />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground">การสนทนา</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={newSession}
              title="แชทใหม่"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {sessions.length === 0 ? (
              <p className="px-4 py-3 text-xs text-muted-foreground/60">ยังไม่มีการสนทนา</p>
            ) : (
              <div className="space-y-0.5 px-2 pb-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted",
                      session.id === activeSessionId && "bg-muted"
                    )}
                    onClick={() => switchSession(session.id)}
                  >
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground/80">
                      {session.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {/* spacer เมื่อไม่ได้อยู่หน้า chat */}
      {(!isOnChat || collapsed) && <div className="flex-1" />}
    </aside>
  )
}

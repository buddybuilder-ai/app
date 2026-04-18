"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  Folder,
  LogOut,
  Plus,
  Search,
  Settings,
  SquarePen,
  Trash2,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChatStore } from "@/stores/chat-store"
import { useAuthStore } from "@/stores/auth-store"
import { useConversations } from "@/hooks/use-conversations"
import { useProjectManager } from "@/hooks/use-project-manager"

interface DashboardSidebarProps {
  onClose?: () => void
}

const PROJECT_PREVIEW_COUNT = 5

export function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const conversationId = useChatStore((s) => s.conversationId)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { conversations, newConversation, switchConversation, deleteConversation } =
    useConversations()
  const { projects } = useProjectManager()

  const [search, setSearch] = useState("")
  const [showAllProjects, setShowAllProjects] = useState(false)

  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter((c) => c.title.toLowerCase().includes(q))
  }, [conversations, search])

  const visibleProjects = showAllProjects
    ? projects
    : projects.slice(0, PROJECT_PREVIEW_COUNT)

  const initials = user?.display_name
    ? user.display_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  async function handleNewChat() {
    await newConversation()
    if (pathname !== "/chat") router.push("/chat")
    onClose?.()
  }

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r bg-muted/30">
      {/* Logo + close (mobile) */}
      <div className="flex h-14 items-center justify-between px-4">
        <Logo />
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Primary actions */}
      <div className="space-y-1 px-3 pb-2">
        <button
          onClick={handleNewChat}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          <SquarePen className="h-4 w-4 shrink-0" />
          <span>แชทใหม่</span>
        </button>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาแชท"
            className="w-full rounded-lg border-none bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:bg-muted focus:bg-muted"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Projects */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between px-2 pb-1 pt-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              โปรเจกต์
            </span>
            <Link
              href="/projects"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              ดูทั้งหมด
            </Link>
          </div>
          {projects.length === 0 ? (
            <Link
              href="/projects"
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4 shrink-0" />
              สร้างโปรเจกต์แรก
            </Link>
          ) : (
            <div className="space-y-0.5">
              {visibleProjects.map((p) => {
                const active = pathname === `/editor/${p.id}`
                return (
                  <Link
                    key={p.id}
                    href={`/editor/${p.id}`}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  </Link>
                )
              })}
              {projects.length > PROJECT_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllProjects((v) => !v)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
                >
                  {showAllProjects ? "ย่อ" : `ดูอีก ${projects.length - PROJECT_PREVIEW_COUNT} โปรเจกต์`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recents */}
        <div className="px-3 pb-6">
          <div className="px-2 pb-1 pt-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              ล่าสุด
            </span>
          </div>
          {filteredConversations.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground/60">
              {search ? "ไม่พบการสนทนา" : "ยังไม่มีการสนทนา"}
            </p>
          ) : (
            <div className="space-y-0.5">
              {filteredConversations.map((conv) => {
                const active = conv.id === conversationId && pathname.startsWith("/chat")
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      switchConversation(conv.id)
                      if (pathname !== "/chat") router.push("/chat")
                      onClose?.()
                    }}
                    className={cn(
                      "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{conv.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.id)
                      }}
                      title="ลบการสนทนา"
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* User + settings */}
      <div className="border-t px-3 py-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user?.display_name ?? "ผู้ใช้"}
                </p>
                {user?.email && (
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
            {user?.email && (
              <>
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2" onClick={onClose}>
                <Settings className="h-4 w-4" />
                ตั้งค่า
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

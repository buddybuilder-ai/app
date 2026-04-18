"use client"

import { FolderOpen } from "lucide-react"
import { ProjectCard } from "./project-card"
import { NewProjectDialog } from "./new-project-dialog"
import { useProjectManager } from "@/hooks/use-project-manager"
import { ROOM_TYPES } from "@/lib/constants"

export function ProjectList() {
  const { projects, deleteProject, renameProject } = useProjectManager()

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">โปรเจกต์ของฉัน</h1>
          <p className="mt-1 text-muted-foreground">
            จัดการโปรเจกต์ออกแบบห้องของคุณ
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <FolderOpen className="h-16 w-16 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-medium">ยังไม่มีโปรเจกต์</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            สร้างโปรเจกต์แรกของคุณเพื่อเริ่มออกแบบห้องสตูดิโอ
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              roomType={
                ROOM_TYPES[project.roomType as keyof typeof ROOM_TYPES]
                  ?.labelTh ?? project.roomType
              }
              roomSpec={project.room_spec}
              layout={project.latest_layout}
              previewImage={project.preview_image}
              updatedAt={formatRelativeTime(project.updatedAt)}
              onDelete={deleteProject}
              onRename={renameProject}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "เมื่อสักครู่"
  if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`
  return date.toLocaleDateString("th-TH")
}

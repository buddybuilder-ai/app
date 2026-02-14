"use client"

import { ProjectCard } from "./project-card"
import { NewProjectDialog } from "./new-project-dialog"

const mockProjects = [
  {
    id: "1",
    name: "Modern Bedroom",
    roomType: "Bedroom",
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    name: "Living Room Design",
    roomType: "Living Room",
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    name: "Home Office",
    roomType: "Office",
    updatedAt: "3 days ago",
  },
]

export function ProjectList() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Projects</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your interior design projects
          </p>
        </div>
        <NewProjectDialog />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  )
}

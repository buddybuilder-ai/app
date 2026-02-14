"use client"

import Link from "next/link"
import { MoreHorizontal, Pencil, Trash2, Box } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProjectCardProps {
  id: string
  name: string
  roomType: string
  updatedAt: string
  onDelete: (id: string) => void
  onRename: (id: string, newName: string) => void
}

export function ProjectCard({
  id,
  name,
  roomType,
  updatedAt,
  onDelete,
  onRename,
}: ProjectCardProps) {
  function handleRename() {
    const newName = window.prompt("ชื่อโปรเจกต์ใหม่:", name)
    if (newName && newName !== name) {
      onRename(id, newName)
    }
  }

  function handleDelete() {
    if (window.confirm(`ลบโปรเจกต์ "${name}" ?`)) {
      onDelete(id)
    }
  }

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <Link href={`/editor/${id}`}>
          <div className="flex h-40 items-center justify-center rounded-t-lg bg-muted">
            <Box className="h-12 w-12 text-muted-foreground/50" />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{name}</h3>
            <p className="text-sm text-muted-foreground">{roomType}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleRename}>
                <Pencil className="mr-2 h-4 w-4" />
                เปลี่ยนชื่อ
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                ลบ
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      <CardFooter className="border-t px-4 py-2">
        <p className="text-xs text-muted-foreground">{updatedAt}</p>
      </CardFooter>
    </Card>
  )
}

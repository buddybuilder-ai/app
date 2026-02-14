import { Skeleton } from "@/components/ui/skeleton"

export default function EditorLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-4 text-center">
        <Skeleton className="mx-auto h-12 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
      </div>
    </div>
  )
}

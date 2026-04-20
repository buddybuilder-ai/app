import { RenderWorkspace } from "@/components/features/editor/render-workspace"

export default async function RenderPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  return <RenderWorkspace projectId={projectId} />
}

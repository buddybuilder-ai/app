import { EditorWorkspace } from "@/components/features/editor/editor-workspace"

export default async function EditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return <EditorWorkspace projectId={projectId} />
}

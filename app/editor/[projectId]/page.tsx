export default async function EditorPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <div className="flex h-full items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-2xl font-bold">3D Editor</h1>
        <p className="mt-2 text-muted-foreground">Project: {projectId}</p>
      </div>
    </div>
  )
}

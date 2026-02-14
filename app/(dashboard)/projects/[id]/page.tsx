export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <h1 className="text-2xl font-bold">Project: {id}</h1>
      <p className="mt-2 text-muted-foreground">Project details</p>
    </div>
  )
}

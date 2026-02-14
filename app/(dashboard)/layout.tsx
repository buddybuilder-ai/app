export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* DashboardSidebar will be added in Phase 4 */}
      <div className="flex flex-1 flex-col">
        {/* DashboardHeader will be added in Phase 4 */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* MarketingHeader will be added in Phase 2 */}
      <main className="flex-1">{children}</main>
      {/* MarketingFooter will be added in Phase 2 */}
    </div>
  )
}

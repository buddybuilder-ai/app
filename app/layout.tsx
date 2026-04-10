import type { Metadata } from "next"
import { notoSansThai } from "@/lib/fonts"
import { ThemeProvider } from "@/providers/theme-provider"
import { QueryProvider } from "@/providers/query-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "BuddyBuilder AI - ออกแบบห้องด้วย AI และฮวงจุ้ย",
  description:
    "แพลตฟอร์มออกแบบห้อง 3 มิติด้วย AI พร้อมการวิเคราะห์ฮวงจุ้ยและการจัดวางเฟอร์นิเจอร์อัจฉริยะ",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={notoSansThai.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

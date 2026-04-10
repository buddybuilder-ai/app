import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  product: [
    { href: "#features", label: "ฟีเจอร์" },
    { href: "#how-it-works", label: "ขั้นตอนการใช้งาน" },
    { href: "/projects", label: "โปรเจคของฉัน" },
  ],
  resources: [
    { href: "#documentation", label: "เอกสาร" },
    { href: "#feng-shui-guide", label: "คู่มือฮวงจุ้ย" },
    { href: "#design-tips", label: "เคล็ดลับการออกแบบ" },
  ],
}

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              แพลตฟอร์มออกแบบห้อง 3 มิติด้วย AI พร้อมการวิเคราะห์ฮวงจุ้ยและการจัดวางเฟอร์นิเจอร์อัจฉริยะ
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">ผลิตภัณฑ์</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">แหล่งข้อมูล</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BuddyBuilder AI. สงวนลิขสิทธิ์
        </p>
      </div>
    </footer>
  )
}

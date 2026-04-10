import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Separator } from "@/components/ui/separator"

const footerLinks = {
  product: [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "/projects", label: "My Projects" },
  ],
  resources: [
    { href: "#documentation", label: "Documentation" },
    { href: "#feng-shui-guide", label: "Feng Shui Guide" },
    { href: "#design-tips", label: "Design Tips" },
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
              AI-Powered 3D Interior Design Platform with Feng Shui analysis
              and smart furniture placement.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Product</h3>
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
            <h3 className="text-sm font-semibold">Resources</h3>
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
          &copy; {new Date().getFullYear()} BuddyBuilder AI. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}

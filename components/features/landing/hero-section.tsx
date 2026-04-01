import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Powered Interior Design</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Design Your Space with{" "}
            <span className="text-primary">AI & Feng Shui</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Create beautiful, harmonious interiors with our AI companion.
            Drag & drop furniture in 3D, get real-time Feng Shui analysis,
            and let AI generate optimal layouts for your space.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/chat">
                <Sparkles className="mr-2 h-4 w-4" />
                ลองถามผู้เชี่ยวชาญฮวงจุ้ย
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">
                Start Designing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ไม่ต้องสมัครสมาชิก · เริ่มใช้งานได้เลย
          </p>
        </div>

        <div className="mt-16 rounded-xl border bg-muted/50 p-4">
          <div className="aspect-video rounded-lg bg-linear-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center">
            <p className="text-muted-foreground">3D Editor Preview</p>
          </div>
        </div>
      </div>
    </section>
  )
}

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
            <span>ออกแบบห้องด้วย AI</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            ออกแบบห้องของคุณด้วย{" "}
            <span className="text-primary">AI และฮวงจุ้ย</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            สร้างพื้นที่อาศัยที่สวยงามและกลมกลืนด้วยผู้ช่วย AI อัจฉริยะ
            ลาก วาง เฟอร์นิเจอร์ใน 3 มิติ รับการวิเคราะห์ฮวงจุ้ยแบบเรียลไทม์
            และให้ AI สร้างผังห้องที่เหมาะสมที่สุดสำหรับคุณ
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
                เริ่มออกแบบ
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
            <p className="text-muted-foreground">ตัวอย่างโปรแกรมแก้ไข 3 มิติ</p>
          </div>
        </div>
      </div>
    </section>
  )
}

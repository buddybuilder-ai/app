import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="border-t bg-primary/5 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            พร้อมเปลี่ยนพื้นที่ของคุณหรือยัง?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            เริ่มออกแบบด้วยคำแนะนำฮวงจุ้ยจาก AI วันนี้
            ไม่จำเป็นต้องมีประสบการณ์ออกแบบ
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/register">
              เริ่มใช้งานฟรี
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

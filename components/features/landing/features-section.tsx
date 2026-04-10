import {
  Box,
  MessageSquare,
  Compass,
  Wand2,
  Languages,
  BarChart3,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const features = [
  {
    icon: Box,
    title: "โปรแกรมแก้ไข 3 มิติ",
    description:
      "ลาก วาง เฟอร์นิเจอร์ในสภาพแวดล้อม 3 มิติแบบเรียลไทม์พร้อมแสงและเงา",
  },
  {
    icon: MessageSquare,
    title: "ผู้ช่วย AI แชท",
    description:
      "รับคำแนะนำการออกแบบเฉพาะตัวที่ขับเคลื่อนด้วย RAG พร้อมการอ้างอิงที่ตรวจสอบแล้ว",
  },
  {
    icon: Compass,
    title: "วิเคราะห์ฮวงจุ้ย",
    description:
      "การให้คะแนนและคำแนะนำอัตโนมัติตามหลักฮวงจุ้ยดั้งเดิม",
  },
  {
    icon: Wand2,
    title: "สร้างผังห้องอัตโนมัติ",
    description:
      "ให้ AI สร้างการจัดวางเฟอร์นิเจอร์ที่เหมาะสมที่สุดด้วยคลิกเดียว",
  },
  {
    icon: Languages,
    title: "รองรับภาษาไทย",
    description:
      "รองรับภาษาไทยเต็มรูปแบบทั้ง UI และการสนทนากับ AI",
  },
  {
    icon: BarChart3,
    title: "ข้อมูลเชิงลึก",
    description:
      "คำแนะนำการออกแบบที่สนับสนุนด้วยข้อมูลจริงและการวิเคราะห์แนวโน้ม",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ทุกสิ่งที่คุณต้องการสำหรับการออกแบบ
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            เครื่องมือทรงพลังผสานกับ AI อัจฉริยะเพื่อการออกแบบภายในที่ง่ายดาย
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 bg-background shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

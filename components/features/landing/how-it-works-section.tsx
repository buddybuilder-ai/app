const steps = [
  {
    step: "01",
    title: "สร้างห้องของคุณ",
    description:
      "กำหนดขนาดห้อง ประตู และหน้าต่าง เลือกประเภทห้องและทิศทาง",
  },
  {
    step: "02",
    title: "ออกแบบด้วย AI",
    description:
      "สนทนากับผู้ช่วย AI หรือให้มันสร้างผังห้องอัตโนมัติตามหลักฮวงจุ้ย",
  },
  {
    step: "03",
    title: "ปรับแต่งใน 3 มิติ",
    description:
      "ปรับแต่งแบบห้องในโปรแกรมแก้ไข 3 มิติ ลาก หมุน และจัดวางเฟอร์นิเจอร์ตามต้องการ",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ขั้นตอนการใช้งาน
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            สามขั้นตอนง่ายๆ สู่ห้องในฝันของคุณ
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {item.step}
              </div>
              <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

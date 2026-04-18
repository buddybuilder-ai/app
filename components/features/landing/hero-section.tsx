"use client"

import Link from "next/link"
import dynamic from "next/dynamic"
import { useRef } from "react"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import TextType from "@/components/ui/text-type"
import { ArrowDown, ArrowRight, Compass, Home, Sparkles, Wand2 } from "lucide-react"

const HeroScene3D = dynamic(
  () => import("./hero-scene-3d").then((m) => m.HeroScene3D),
  { ssr: false, loading: () => null }
)

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  // Section is 220vh tall. Sticky child pins during scroll, so the last 100vh
  // of the section is "off-screen" space where sticky has already released.
  // We map animation progress to 0..0.55 (the scrubbing window) and keep
  // final overlay fully visible from 0.55 onward, so it stays after pin releases.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.4,
  })

  const scrollHintOpacity = useTransform(smoothProgress, [0, 0.03, 0.08], [1, 1, 0])
  const initialHeadingOpacity = useTransform(smoothProgress, [0.3, 0.45], [1, 0])
  const finalHeadingOpacity = useTransform(smoothProgress, [0.4, 0.55, 1], [0, 1, 1])
  const ctaGlowOpacity = useTransform(smoothProgress, [0.4, 0.55, 1], [0, 1, 1])
  const arrowOpacity = useTransform(smoothProgress, [0.4, 0.55, 1], [0, 1, 1])
  // Heading starts vertically centred and slides up to ~10% from top as user scrolls.
  const headingTop = useTransform(smoothProgress, [0, 0.4], ["40%", "5%"])
  const headingTranslateY = useTransform(smoothProgress, [0, 0.4], ["-50%", "0%"])
  // Hide the opposite heading entirely (display:none) to stop TextType animation loops
  // from running underneath the visible one.
  const initialHeadingDisplay = useTransform(smoothProgress, (v) => (v >= 0.45 ? "none" : "block"))
  const finalHeadingDisplay = useTransform(smoothProgress, (v) => (v < 0.4 ? "none" : "block"))

  return (
    <section ref={containerRef} className="relative h-[220vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,_hsl(var(--foreground)/0.08)_1px,_transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,_black_40%,_transparent_80%)]"
        />

        <motion.div
          aria-hidden
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-32 top-10 h-[36rem] w-[36rem] rounded-full bg-primary/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, -30, 20, 0], y: [0, 40, -20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-40 top-1/3 h-[40rem] w-[40rem] rounded-full bg-[#b87a6e]/20 blur-3xl"
        />
        <motion.div
          aria-hidden
          animate={{ x: [0, 20, -30, 0], y: [0, 20, -30, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-[#5b7c99]/15 blur-3xl"
        />

        <motion.div
          aria-hidden
          style={{ scaleY: smoothProgress }}
          className="absolute right-6 top-1/2 z-20 h-40 w-[2px] origin-top -translate-y-1/2 rounded-full bg-primary/60"
        />
        <div
          aria-hidden
          className="absolute right-[21px] top-1/2 z-10 h-40 w-[2px] -translate-y-1/2 rounded-full bg-foreground/10"
        />

        <div className="absolute inset-x-0 bottom-0 top-[15%]">
          <HeroScene3D progress={smoothProgress} />
        </div>

        <motion.div
          style={{ top: headingTop, translateY: headingTranslateY }}
          className="absolute inset-x-0 z-10 flex flex-col items-center px-6 text-center"
        >
          <div className="relative mb-8">
            <motion.div
              aria-hidden
              animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.08, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 rounded-full bg-primary/40 blur-2xl"
            />
            <div className="relative rounded-full bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 p-[1.5px]">
              <div className="flex items-center gap-3 rounded-full bg-background/90 px-5 py-2 shadow-sm backdrop-blur-md">
                <div className="flex -space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 ring-2 ring-background">
                    <Wand2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/25 ring-2 ring-background">
                    <Home className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/35 ring-2 ring-background">
                    <Compass className="h-3.5 w-3.5 text-primary" />
                  </div>
                </div>
                <span className="text-sm font-medium">ออกแบบห้องด้วย AI และฮวงจุ้ย</span>
                <motion.span
                  aria-hidden
                  animate={{ rotate: [0, 15, 0, -15, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="text-primary"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.span>
              </div>
            </div>
          </div>
          <div className="relative w-full max-w-4xl">
            <motion.h1
              style={{ opacity: initialHeadingOpacity, display: initialHeadingDisplay }}
              className="text-4xl font-bold tracking-tight sm:text-6xl"
            >
              ห้องของคุณ{" "}
              <TextType
                as="span"
                text={["ประกอบร่าง", "ลงตัว", "สวยงาม", "สมดุล", "น่าอยู่"]}
                typingSpeed={90}
                deletingSpeed={45}
                pauseDuration={1600}
                className="text-primary"
                cursorClassName="text-primary"
                cursorCharacter="|"
              />
              <br className="hidden sm:inline" />
              ด้วย AI ในไม่กี่วินาที
            </motion.h1>
            <motion.h1
              style={{ opacity: finalHeadingOpacity, display: finalHeadingDisplay }}
              className="absolute inset-0 text-4xl font-bold tracking-tight sm:text-6xl"
            >
              พร้อม
              <TextType
                as="span"
                text={["ออกแบบห้อง", "จัดเฟอร์นิเจอร์", "เริ่มต้น"]}
                typingSpeed={90}
                deletingSpeed={45}
                pauseDuration={1800}
                className="text-primary"
                cursorClassName="text-primary"
                cursorCharacter="|"
              />
              <br className="hidden sm:inline" />
              ของคุณแล้วหรือยัง?
            </motion.h1>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-widest text-muted-foreground"
        >
          ↓ Scroll
        </motion.div>

        <div className="absolute inset-x-0 bottom-[14%] z-10 flex flex-col items-center px-6">
          <motion.div
            style={{ opacity: arrowOpacity }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-4 text-primary"
            aria-hidden
          >
            <ArrowDown className="h-6 w-6" />
          </motion.div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div className="relative">
              <motion.span
                style={{ opacity: ctaGlowOpacity }}
                animate={{ scale: [1, 1.25, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 -z-10 rounded-full bg-primary/50 blur-2xl"
                aria-hidden
              />
              <Button size="lg" asChild className="shadow-lg shadow-primary/30">
                <Link href="/register">
                  <Sparkles className="mr-2 h-4 w-4" />
                  เริ่มจัดห้อง
                </Link>
              </Button>
            </div>
            <Button size="lg" variant="outline" asChild className="bg-background/70 backdrop-blur-sm">
              <Link href="/chat">
                ปรึกษาฮวงจุ้ย
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

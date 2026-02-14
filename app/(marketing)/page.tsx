import { HeroSection } from "@/components/features/landing/hero-section"
import { FeaturesSection } from "@/components/features/landing/features-section"
import { HowItWorksSection } from "@/components/features/landing/how-it-works-section"
import { CTASection } from "@/components/features/landing/cta-section"

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </>
  )
}

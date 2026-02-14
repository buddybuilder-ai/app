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
    title: "3D Interior Editor",
    description:
      "Drag & drop furniture in a real-time 3D environment with lighting and shadows.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Companion",
    description:
      "Get personalized design advice powered by RAG with verified references.",
  },
  {
    icon: Compass,
    title: "Feng Shui Analysis",
    description:
      "Automatic scoring and recommendations based on traditional Feng Shui principles.",
  },
  {
    icon: Wand2,
    title: "Auto Layout Generation",
    description:
      "Let AI create optimal furniture arrangements with one click.",
  },
  {
    icon: Languages,
    title: "Thai & English",
    description:
      "Full bilingual support for both the UI and AI conversations.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description:
      "Design recommendations backed by real data and trend analysis.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to Design
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful tools combined with AI intelligence for effortless interior design.
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

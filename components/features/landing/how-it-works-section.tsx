const steps = [
  {
    step: "01",
    title: "Create Your Room",
    description:
      "Set up your room dimensions, doors, and windows. Choose the room type and direction.",
  },
  {
    step: "02",
    title: "Design with AI",
    description:
      "Chat with our AI companion or let it auto-generate a layout based on Feng Shui principles.",
  },
  {
    step: "03",
    title: "Customize in 3D",
    description:
      "Fine-tune your design in the 3D editor. Drag, rotate, and adjust furniture to your liking.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to your perfect interior.
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

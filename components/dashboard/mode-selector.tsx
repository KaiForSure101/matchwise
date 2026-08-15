import {
  Briefcase,
  GraduationCap,
  Heart,
  Puzzle,
  Sparkles,
  Users,
  Volleyball,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const MODES = [
  {
    title: "Dating",
    description: "Aligned values, pacing, and relationship intent.",
    icon: Heart,
  },
  {
    title: "Friends",
    description: "Shared interests, availability, and social energy.",
    icon: Users,
  },
  {
    title: "Study",
    description: "Subjects, focus style, and accountability habits.",
    icon: GraduationCap,
  },
  {
    title: "Activities",
    description: "Hobbies, schedule fit, and preferred group size.",
    icon: Volleyball,
  },
  {
    title: "Professional",
    description: "Skills, goals, and collaboration preferences.",
    icon: Briefcase,
  },
  {
    title: "Teams",
    description: "Role fit, working rhythm, and delivery context.",
    icon: Puzzle,
  },
  {
    title: "Custom Match",
    description: "Define your own goal and evidence criteria.",
    icon: Sparkles,
  },
] as const

export function ModeSelector() {
  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[#0f4c45] sm:text-3xl">
          Choose a matching mode
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Matchwise does not use one universal score. Each mode applies its own
          deterministic rules — AI explains context, never invents compatibility.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MODES.map((mode) => {
          const Icon = mode.icon
          return (
            <Card
              key={mode.title}
              className="border-[#0f4c45]/10 bg-white/80 transition-transform duration-200 hover:-translate-y-0.5 hover:border-[#0f4c45]/25"
            >
              <CardHeader className="gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#0f4c45]/8 text-[#0f4c45]">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-lg">{mode.title}</CardTitle>
                <CardDescription>{mode.description}</CardDescription>
                <p className="pt-1 text-xs font-medium uppercase tracking-[0.14em] text-[#0f4c45]/70">
                  Coming in next phase
                </p>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </section>
  )
}

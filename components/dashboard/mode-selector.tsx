"use client"

import {
  Briefcase,
  GraduationCap,
  Heart,
  Puzzle,
  Sparkles,
  Users,
  Volleyball,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { FormMessage } from "@/components/profile/ui-bits"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MODE_META, type MatchMode, MATCH_MODES } from "@/lib/constants/modes"
import { setActiveMode } from "@/lib/actions/profile"
import { cn } from "@/lib/utils"

const ICONS = {
  dating: Heart,
  friends: Users,
  study: GraduationCap,
  activities: Volleyball,
  professional: Briefcase,
  teams: Puzzle,
  custom: Sparkles,
} as const

export function ModeSelector({
  activeMode,
  redirectTo,
}: {
  activeMode: MatchMode | null
  redirectTo?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selected, setSelected] = useState<MatchMode | null>(activeMode)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function choose(mode: MatchMode) {
    setError(null)
    setSuccess(null)
    setSelected(mode)

    startTransition(async () => {
      const result = await setActiveMode(mode)
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess(`Mode set to ${MODE_META[mode].label}. Matching comes later.`)
      if (redirectTo) {
        router.push(redirectTo)
      }
      router.refresh()
    })
  }

  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[#0f4c45] sm:text-3xl">
          Choose a matching mode
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Matchwise changes its objective depending on your purpose. This sets
          your current context — it does not run matching yet.
        </p>
      </div>

      <FormMessage error={error} success={success} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MATCH_MODES.map((mode) => {
          const meta = MODE_META[mode]
          const Icon = ICONS[mode]
          const isActive = selected === mode

          return (
            <button
              key={mode}
              type="button"
              disabled={pending}
              onClick={() => choose(mode)}
              className="text-left disabled:opacity-60"
            >
              <Card
                className={cn(
                  "h-full border-[#0f4c45]/10 bg-white/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0f4c45]/25",
                  isActive && "border-[#0f4c45]/40 ring-2 ring-[#0f4c45]/20"
                )}
              >
                <CardHeader className="gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#0f4c45]/8 text-[#0f4c45]">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">{meta.label}</CardTitle>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-[#0f4c45]/70">
                    {meta.tagline}
                  </p>
                  <CardDescription>{meta.description}</CardDescription>
                  {isActive ? (
                    <p className="pt-1 text-xs font-medium text-[#0f4c45]">
                      Current mode
                    </p>
                  ) : null}
                </CardHeader>
              </Card>
            </button>
          )
        })}
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { BasicProfileForm } from "@/components/profile/basic-profile-form"
import { ContextProfileForm } from "@/components/profile/context-profile-form"
import { AvailabilityManager } from "@/components/profile/availability-manager"
import { InterestsManager } from "@/components/profile/interests-manager"
import { ModeSelector } from "@/components/dashboard/mode-selector"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { buttonVariants } from "@/components/ui/button"
import type { MatchMode } from "@/lib/constants/modes"
import type { ProfileBundle } from "@/lib/types/profile"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: "basics", label: "Basics" },
  { id: "mode", label: "Mode" },
  { id: "context", label: "Context" },
  { id: "extras", label: "Extras" },
] as const

type StepId = (typeof STEPS)[number]["id"]

export function OnboardingWizard({ bundle }: { bundle: ProfileBundle }) {
  const initialStep = useMemo<StepId>(() => {
    if (!bundle.profile?.display_name && !bundle.profile?.username) return "basics"
    if (!bundle.profile?.active_mode) return "mode"
    const mode = bundle.profile.active_mode
    const hasContext = bundle.contextProfiles.some((c) => c.mode === mode)
    if (!hasContext) return "context"
    return "extras"
  }, [bundle])

  const [step, setStep] = useState<StepId>(initialStep)
  const stepIndex = STEPS.findIndex((s) => s.id === step)
  const mode = (bundle.profile?.active_mode ?? "friends") as MatchMode
  const context =
    bundle.contextProfiles.find((c) => c.mode === mode) ?? null

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageIntro
        eyebrow="Setup"
        title="Build your Matchwise profile gradually"
        description="A short path: basics → mode → context → a few extras. Skip anything that does not feel useful yet."
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#0f4c45]">
            Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}
          </span>
          <span className="text-muted-foreground">
            Matching evidence grows as you add structure — never a pressure score.
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={cn(
                "h-2 rounded-full transition-colors",
                index <= stepIndex ? "bg-[#0f4c45]" : "bg-[#0f4c45]/15"
              )}
              aria-label={`Go to ${item.label}`}
            />
          ))}
        </div>
      </div>

      {step === "basics" ? (
        <SectionCard
          title="Basic profile"
          description="Display name, username, birthday, and approximate location."
        >
          <BasicProfileForm profile={bundle.profile} />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className={cn(buttonVariants({ size: "sm" }), "bg-[#0f4c45] text-white hover:bg-[#0c3d38]")}
              onClick={() => setStep("mode")}
            >
              Continue to mode
            </button>
          </div>
        </SectionCard>
      ) : null}

      {step === "mode" ? (
        <div className="space-y-4">
          <ModeSelector activeMode={bundle.profile?.active_mode ?? null} />
          <div className="flex justify-between">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              onClick={() => setStep("basics")}
            >
              Back
            </button>
            <button
              type="button"
              className={cn(buttonVariants({ size: "sm" }), "bg-[#0f4c45] text-white hover:bg-[#0c3d38]")}
              onClick={() => setStep("context")}
            >
              Continue to context
            </button>
          </div>
        </div>
      ) : null}

      {step === "context" ? (
        <SectionCard
          title="Context for your mode"
          description="Tell Matchwise what this mode is about. Keep it short."
        >
          <ContextProfileForm mode={mode} context={context} />
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              onClick={() => setStep("mode")}
            >
              Back
            </button>
            <button
              type="button"
              className={cn(buttonVariants({ size: "sm" }), "bg-[#0f4c45] text-white hover:bg-[#0c3d38]")}
              onClick={() => setStep("extras")}
            >
              Continue to extras
            </button>
          </div>
        </SectionCard>
      ) : null}

      {step === "extras" ? (
        <div className="space-y-6">
          <SectionCard
            title="Availability"
            description="Optional — helps later schedule-aware matching."
          >
            <AvailabilityManager availability={bundle.availability} />
          </SectionCard>
          <SectionCard
            title="Add an interest (optional)"
            description="You can add more anytime from your profile."
          >
            <InterestsManager interests={bundle.interests} />
          </SectionCard>
          <div className="flex flex-wrap justify-between gap-3">
            <button
              type="button"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              onClick={() => setStep("context")}
            >
              Back
            </button>
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
              )}
            >
              Return to dashboard
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}

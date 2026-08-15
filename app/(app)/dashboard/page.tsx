import Link from "next/link"

import { ModeSelector } from "@/components/dashboard/mode-selector"
import { EvidenceBanner } from "@/components/profile/evidence-banner"
import { buttonVariants } from "@/components/ui/button"
import { MODE_META } from "@/lib/constants/modes"
import { getProfileBundle } from "@/lib/actions/profile"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Dashboard · Matchwise",
}

export default async function DashboardPage() {
  const bundle = await getProfileBundle()
  const activeMode = bundle.profile?.active_mode ?? null

  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#0f4c45]/70">
          Your workspace
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#0f4c45] sm:text-4xl">
          Find the right person for what you&apos;re trying to create
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {activeMode
            ? `Current mode: ${MODE_META[activeMode].label} — ${MODE_META[activeMode].tagline}. Matching logic comes later; for now, build structured context.`
            : "Start by picking a relationship goal, then add the structured data Matchwise will use later."}
        </p>
      </div>

      <EvidenceBanner bundle={bundle} />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/discover/dating"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
          )}
        >
          Explore matches
        </Link>
        <Link
          href="/custom"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
          )}
        >
          Try custom match
        </Link>
        <Link
          href="/onboarding"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
          )}
        >
          Continue setup
        </Link>
        <Link
          href="/profile"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Open profile
        </Link>
      </div>

      <ModeSelector activeMode={activeMode} />
    </div>
  )
}

import { ContextProfileForm } from "@/components/profile/context-profile-form"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Context · Matchwise" }

export default async function ContextPage() {
  const bundle = await getProfileBundle()
  const mode = bundle.profile?.active_mode ?? "friends"

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Context profile"
        title="Mode-specific details"
        description="A global profile is not enough. Capture what this mode is about so later matching can stay goal-aware."
      />
      <SectionCard title="Context for your current purpose">
        <ContextProfileForm
          mode={mode}
          contexts={bundle.contextProfiles}
          allowModeChange
        />
      </SectionCard>
    </div>
  )
}

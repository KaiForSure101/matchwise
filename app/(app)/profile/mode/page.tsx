import { ModeSelector } from "@/components/dashboard/mode-selector"
import { PageIntro } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Mode · Matchwise" }

export default async function ModePage() {
  const bundle = await getProfileBundle()

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Mode"
        title="What are you trying to create?"
        description="Selecting a mode sets context for your profile data. It does not start discovery or scoring."
      />
      <ModeSelector activeMode={bundle.profile?.active_mode ?? null} />
    </div>
  )
}

import { PreferencesManager } from "@/components/profile/preferences-manager"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Preferences · Matchwise" }

export default async function PreferencesPage() {
  const bundle = await getProfileBundle()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Preferences"
        title="What you want — and what must be true"
        description="Mark hard boundaries when a condition must be satisfied. Soft preferences stay desirable but not mandatory. No scoring in this phase."
      />
      <SectionCard title="Your preferences">
        <PreferencesManager
          preferences={bundle.preferences}
          defaultMode={bundle.profile?.active_mode ?? null}
        />
      </SectionCard>
    </div>
  )
}

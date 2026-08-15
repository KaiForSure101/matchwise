import { InterestsManager } from "@/components/profile/interests-manager"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Interests · Matchwise" }

export default async function InterestsPage() {
  const bundle = await getProfileBundle()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Interests"
        title="What you enjoy"
        description="Add interests with involvement level and whether you want someone to share them."
      />
      <SectionCard title="Your interests">
        <InterestsManager interests={bundle.interests} />
      </SectionCard>
    </div>
  )
}

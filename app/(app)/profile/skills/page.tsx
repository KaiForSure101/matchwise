import { SkillsManager } from "@/components/profile/skills-manager"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Skills · Matchwise" }

export default async function SkillsPage() {
  const bundle = await getProfileBundle()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Skills"
        title="What you can do — and want to learn"
        description="Useful later for Study, Professional, and Teams. Level, can teach, and wants to learn are stored separately."
      />
      <SectionCard title="Your skills">
        <SkillsManager skills={bundle.skills} />
      </SectionCard>
    </div>
  )
}

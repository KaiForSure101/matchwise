import { AnswersManager } from "@/components/profile/answers-manager"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Answers · Matchwise" }

export default async function AnswersPage() {
  const bundle = await getProfileBundle()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Answers"
        title="Questionnaire responses"
        description="Choose Answered, Don't know, Prefer not to answer, Not applicable, or leave Not answered. Missing information should reduce confidence later — not punish compatibility."
      />
      <SectionCard title="Starter questions">
        <AnswersManager
          answers={bundle.answers}
          activeMode={bundle.profile?.active_mode ?? null}
        />
      </SectionCard>
    </div>
  )
}

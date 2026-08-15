import { AvailabilityManager } from "@/components/profile/availability-manager"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Availability · Matchwise" }

export default async function AvailabilityPage() {
  const bundle = await getProfileBundle()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Availability"
        title="When you are generally free"
        description="Morning, afternoon, evening, or late night. Simple blocks only — no calendar sync."
      />
      <SectionCard title="Availability blocks">
        <AvailabilityManager availability={bundle.availability} />
      </SectionCard>
    </div>
  )
}

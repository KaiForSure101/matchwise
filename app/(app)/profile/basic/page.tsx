import { BasicProfileForm } from "@/components/profile/basic-profile-form"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Basic profile · Matchwise" }

export default async function BasicProfilePage() {
  const bundle = await getProfileBundle()

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        eyebrow="Basics"
        title="Your account profile"
        description="Save what you are comfortable sharing. You can change this later — nothing here is scored as a human-value rating."
      />
      <SectionCard title="Basic information">
        <BasicProfileForm profile={bundle.profile} />
      </SectionCard>
    </div>
  )
}

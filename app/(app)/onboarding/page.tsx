import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"
import { getProfileBundle } from "@/lib/actions/profile"

export const metadata = { title: "Setup · Matchwise" }

export default async function OnboardingPage() {
  const bundle = await getProfileBundle()
  return <OnboardingWizard bundle={bundle} />
}

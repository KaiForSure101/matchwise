import type { EvidenceLevel, ProfileBundle } from "@/lib/types/profile"

/**
 * Soft completeness signal for UI — never a match score or human-value rating.
 */
export function computeEvidenceLevel(bundle: ProfileBundle): {
  level: EvidenceLevel
  filled: number
  total: number
  hint: string
} {
  const { profile, contextProfiles, preferences, answers, interests, skills, availability } =
    bundle

  const checks = [
    Boolean(profile?.display_name?.trim()),
    Boolean(profile?.username?.trim()),
    Boolean(profile?.date_of_birth),
    Boolean(profile?.location_text?.trim()),
    Boolean(profile?.active_mode),
    contextProfiles.some(
      (c) =>
        Boolean(c.looking_for?.trim()) ||
        Boolean(c.goal?.trim()) ||
        Boolean(c.notes?.trim())
    ),
    preferences.length > 0,
    answers.some((a) => a.answer_state === "answered"),
    interests.length > 0,
    skills.length > 0,
    availability.length > 0,
  ]

  const filled = checks.filter(Boolean).length
  const total = checks.length
  const ratio = filled / total

  let level: EvidenceLevel = "Limited"
  if (ratio >= 0.75) level = "Strong"
  else if (ratio >= 0.5) level = "Moderate"
  else if (ratio >= 0.25) level = "Emerging"

  const hints: Record<EvidenceLevel, string> = {
    Limited:
      "A few basics help Matchwise understand your context when matching starts later.",
    Emerging:
      "Answering a few more questions may help Matchwise make stronger recommendations.",
    Moderate:
      "You have useful structure in place. Add more only if it feels relevant.",
    Strong:
      "You have solid structured data across profile areas. You can refine anytime.",
  }

  return { level, filled, total, hint: hints[level] }
}

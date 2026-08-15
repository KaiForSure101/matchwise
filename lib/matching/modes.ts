import type { MatchMode } from "../constants/modes"
import { buildMatchingResult, evaluateHardBoundaries, type BoundaryPreference, type MatchingFactor, type MatchingResult } from "."

export const DISCOVERY_MODES = ["dating", "friends", "study", "teams"] as const
export type DiscoveryMode = (typeof DISCOVERY_MODES)[number]

export type DiscoveryPerson = {
  id: string
  displayName: string
  username: string | null
  location: string | null
  avatarUrl: string | null
  context: Record<string, string | null>
  preferences: BoundaryPreference[]
  interests: string[]
  skills: Array<{ name: string; level: string; canTeach: boolean; wantsToLearn: boolean }>
  availability: string[]
}

export type DiscoveryResult = {
candidate: Pick<DiscoveryPerson, "id" | "displayName" | "username" | "location" | "avatarUrl" | "interests" | "skills" | "availability"> & {
  context?: Record<string, string | null>
}
mode: DiscoveryMode
quality: "strong" | "good" | "moderate" | "low" | "insufficient"
confidence: MatchingResult["confidence"]["level"]
reasons: string[]
uncertainties: string[]
eligible: boolean
}

const modeWeights: Record<DiscoveryMode, Record<string, number>> = {
  dating: { future: 4, process: 3, daily_life: 2, practicality: 1, interests: 1 },
  friends: { interests: 4, availability: 3, social: 2, practicality: 1 },
  study: { subject: 4, skills: 4, availability: 2, commitment: 2 },
  teams: { complementary_skills: 5, roles: 3, availability: 2, interests: 1 },
}

function overlap(left: string[], right: string[]) {
  if (!left.length || !right.length) return null
  const a = new Set(left.map((item) => item.toLowerCase()))
  const b = new Set(right.map((item) => item.toLowerCase()))
  const shared = [...a].filter((item) => b.has(item)).length
  return shared / new Set([...a, ...b]).size
}

function exact(left: string | null | undefined, right: string | null | undefined) {
  if (!left?.trim() || !right?.trim()) return null
  return left.trim().toLowerCase() === right.trim().toLowerCase() ? 1 : 0
}

function factor(id: string, label: string, weight: number, score: number | null, explanation: string): MatchingFactor {
  return { id, label, importance: weight >= 4 ? "high" : weight >= 2 ? "medium" : "low", weight, score, evidence: score === null ? "not_answered" : score > 0 ? "known_compatible" : "known_incompatible", explanation }
}

function quality(score: number | null): DiscoveryResult["quality"] {
  if (score === null) return "insufficient"
  if (score >= 0.8) return "strong"
  if (score >= 0.65) return "good"
  if (score >= 0.4) return "moderate"
  return "low"
}

export function evaluateModeMatch(mode: DiscoveryMode, source: DiscoveryPerson, candidate: DiscoveryPerson, sourceBlockedIds: string[] = [], candidateBlockedIds: string[] = []): DiscoveryResult {
  const weights = modeWeights[mode]
  const sourceContext = source.context
  const candidateContext = candidate.context
  const availability = overlap(source.availability, candidate.availability)
  const interests = overlap(source.interests, candidate.interests)
  let factors: MatchingFactor[]

  if (mode === "dating") {
    factors = [
      factor("future", "Relationship goals", weights.future, exact(sourceContext.relationship_intent, candidateContext.relationship_intent), "Your stated relationship goals align."),
      factor("process", "Relationship structure", weights.process, exact(sourceContext.relationship_structure, candidateContext.relationship_structure), "Your stated relationship structure aligns."),
      factor("daily_life", "Availability", weights.daily_life, availability, "You have realistic times when you could meet."),
      factor("practicality", "Location", weights.practicality, exact(source.location, candidate.location), "You are in the same approximate area."),
      factor("interests", "Relevant interests", weights.interests, interests, "You share stated interests."),
    ]
  } else if (mode === "friends") {
    factors = [
      factor("interests", "Shared interests", weights.interests, interests, "You share several interests."),
      factor("availability", "Availability", weights.availability, availability, "You have overlapping availability."),
      factor("social", "Connection style", weights.social, exact(sourceContext.looking_for, candidateContext.looking_for), "Your stated connection goals align."),
      factor("practicality", "Location", weights.practicality, exact(source.location, candidate.location), "You are in the same approximate area."),
    ]
  } else if (mode === "study") {
    const subject = exact(sourceContext.study_subject, candidateContext.study_subject)
    const sourceNeeds = new Set(source.skills.filter((skill) => skill.wantsToLearn).map((skill) => skill.name.toLowerCase()))
    const candidateTeaches = new Set(candidate.skills.filter((skill) => skill.canTeach).map((skill) => skill.name.toLowerCase()))
    const skillScore = sourceNeeds.size || candidateTeaches.size ? [...sourceNeeds].filter((name) => candidateTeaches.has(name)).length / Math.max(1, sourceNeeds.size) : null
    factors = [
      factor("subject", "Study subject", weights.subject, subject, "Your stated study subjects align."),
      factor("skills", "Teach and learn fit", weights.skills, skillScore, "Their skills can support what you want to learn."),
      factor("availability", "Availability", weights.availability, availability, "You have overlapping time for study."),
      factor("commitment", "Study relationship", weights.commitment, exact(sourceContext.study_relationship_type, candidateContext.study_relationship_type), "Your study-partner expectations align."),
    ]
  } else {
    const sourceSkills = new Set(source.skills.map((skill) => skill.name.toLowerCase()))
    const candidateSkills = candidate.skills.map((skill) => skill.name.toLowerCase())
    const complementary = sourceSkills.size || candidateSkills.length ? candidateSkills.filter((skill) => !sourceSkills.has(skill)).length / Math.max(1, candidateSkills.length) : null
    factors = [
      factor("complementary_skills", "Complementary skills", weights.complementary_skills, complementary, "Their skills could complement your current capabilities."),
      factor("roles", "Role preference", weights.roles, exact(sourceContext.role_preference, candidateContext.role_preference) === 1 ? 0 : sourceContext.role_preference && candidateContext.role_preference ? 1 : null, "Your stated roles are complementary."),
      factor("availability", "Availability", weights.availability, availability, "You have overlapping availability for collaboration."),
      factor("interests", "Relevant interests", weights.interests, interests, "You share relevant interests."),
    ]
  }

  const definitions = [...new Set([...source.preferences, ...candidate.preferences].map((preference) => preference.key))].map((key) => ({
    key,
    label: key.replaceAll("_", " "),
    compare: (left: BoundaryPreference, right: BoundaryPreference) => left.value.toLowerCase() === right.value.toLowerCase() ? { outcome: "satisfied" as const } : { outcome: "conflict" as const, reason: `Your stated hard boundaries for ${key.replaceAll("_", " ")} conflict.` },
  }))
  const boundaryChecks = evaluateHardBoundaries({ sourcePreferences: source.preferences, candidatePreferences: candidate.preferences, definitions })
  const result = buildMatchingResult({
    sourceUserId: source.id,
    candidateUserId: candidate.id,
    mode: mode as MatchMode,
    sourceBlockedUserIds: sourceBlockedIds,
    candidateBlockedUserIds: candidateBlockedIds,
    requiredChecks: [{ id: "mode_context", eligible: Boolean(sourceContext.looking_for || sourceContext.goal) && Boolean(candidateContext.looking_for || candidateContext.goal), reason: "Both people need some context for this mode." }],
    boundaryChecks,
    scoringFactors: factors,
  })
  return { candidate: { id: candidate.id, displayName: candidate.displayName, username: candidate.username, location: candidate.location, avatarUrl: candidate.avatarUrl, interests: candidate.interests, skills: candidate.skills, availability: candidate.availability }, mode, quality: quality(result.score), confidence: result.confidence.level, reasons: result.explanations.reasons.slice(0, 3), uncertainties: result.explanations.uncertainties.slice(0, 2), eligible: result.eligible }
}

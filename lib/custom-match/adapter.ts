import { getDiscoveryResults } from "@/lib/actions/discovery"
import type { DiscoveryResult } from "@/lib/matching/modes"

import type { CustomMatchCriteria, CustomMatchCriterion } from "./schema"

export type CustomMatchExecutionResult = {
  candidate: DiscoveryResult["candidate"] & { context?: Record<string, string | null> }
  mode: CustomMatchCriteria["mode"]
  score: number
  quality: DiscoveryResult["quality"]
  confidence: DiscoveryResult["confidence"]
  reasons: string[]
  uncertainties: string[]
  criteriaSatisfied: string[]
  missingCriteria: string[]
}

const importanceWeight: Record<CustomMatchCriterion["importance"], number> = {
  required: 4,
  high: 3,
  medium: 2,
  low: 1,
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function matchCriterion(result: DiscoveryResult, criterion: CustomMatchCriterion) {
  const candidate = result.candidate
  const skillNames = new Set(candidate.skills.map((skill) => normalize(skill.name)))
  const availability = new Set(candidate.availability.map((slot) => normalize(slot)))
  const interests = new Set(candidate.interests.map((interest) => normalize(interest)))
  const context = candidate.context ?? {}

  switch (criterion.key) {
    case "skills": {
      const matches = Array.isArray(criterion.value)
        ? criterion.value.map((item) => normalize(String(item)))
        : [normalize(String(criterion.value))]
      return matches.some((value) => skillNames.has(value))
    }
    case "availability": {
      const matches = Array.isArray(criterion.value)
        ? criterion.value.map((item) => normalize(String(item)))
        : [normalize(String(criterion.value))]
      return matches.some((value) => availability.has(value))
    }
    case "interests": {
      const matches = Array.isArray(criterion.value)
        ? criterion.value.map((item) => normalize(String(item)))
        : [normalize(String(criterion.value))]
      return matches.some((value) => interests.has(value))
    }
    case "roles": {
      const expected = normalize(String(criterion.value))
      return normalize(String(context.role_preference ?? "")) === expected
    }
    case "goal": {
      const expected = normalize(String(criterion.value))
      return normalize(String(context.goal ?? "")) === expected
    }
    case "study_subject": {
      const expected = normalize(String(criterion.value))
      return normalize(String(context.study_subject ?? "")) === expected
    }
    case "relationship_intent": {
      const expected = normalize(String(criterion.value))
      return normalize(String(context.relationship_intent ?? "")) === expected
    }
    case "location": {
      const expected = normalize(String(criterion.value))
      return normalize(String(candidate.location ?? "")) === expected
    }
    default:
      return true
  }
}

export async function executeCustomMatch(criteria: CustomMatchCriteria) {
  const mode = criteria.mode
  const baseResults = await getDiscoveryResults(mode)

  const hardCriteria = criteria.criteria.filter((criterion) => criterion.hard || criterion.importance === "required")
  const softerCriteria = criteria.criteria.filter((criterion) => !criterion.hard && criterion.importance !== "required")

  const filtered = baseResults.filter((result) => {
    const candidate = result.candidate
    const passesHardRequirements = hardCriteria.every((criterion) => matchCriterion(result, criterion))

    if (!passesHardRequirements) {
      return false
    }

    if (criteria.requestedSkills.length > 0) {
      const skills = new Set(candidate.skills.map((skill) => normalize(skill.name)))
      const requiredSkillMatches = criteria.requestedSkills.every((skill) => skills.has(normalize(skill)))
      if (!requiredSkillMatches) return false
    }

    if (criteria.availabilityRequirements.length > 0) {
      const availability = new Set(candidate.availability.map((slot) => normalize(slot)))
      const requiredAvailabilityMatches = criteria.availabilityRequirements.every((slot) => availability.has(normalize(slot)))
      if (!requiredAvailabilityMatches) return false
    }

    return true
  })

  const scored = filtered.map((result) => {
    const matchedCriteria = criteria.criteria.filter((criterion) => matchCriterion(result, criterion))
    const matchedKeys = matchedCriteria.map((criterion) => criterion.key)
    const customScore = criteria.criteria.reduce((total, criterion) => {
      if (!matchCriterion(result, criterion)) return total
      return total + importanceWeight[criterion.importance]
    }, 0)

    const softScore = softerCriteria.reduce((total, criterion) => {
      if (!matchCriterion(result, criterion)) return total
      return total + importanceWeight[criterion.importance]
    }, 0)

    const qualityScore = result.quality === "strong" ? 4 : result.quality === "good" ? 3 : result.quality === "moderate" ? 2 : result.quality === "low" ? 1 : 0
    const combinedScore = customScore + softScore + qualityScore

    return {
      candidate: result.candidate,
      mode,
      score: combinedScore,
      quality: result.quality,
      confidence: result.confidence,
      reasons: result.reasons,
      uncertainties: result.uncertainties,
      criteriaSatisfied: matchedKeys.map((key) => key.replaceAll("_", " ")),
      missingCriteria: criteria.criteria
        .filter((criterion) => !matchCriterion(result, criterion))
        .map((criterion) => criterion.key.replaceAll("_", " ")),
    } satisfies CustomMatchExecutionResult
  })

  scored.sort((left, right) => right.score - left.score)
  return scored.slice(0, 10)
}

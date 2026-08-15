import { describe, expect, it } from "vitest"

import {
  buildMatchExplanation,
  buildMatchingResult,
  calculateConfidence,
  calculateWeightedScore,
  evaluateEligibility,
  evaluateHardBoundaries,
  type BoundaryDefinition,
  type MatchingFactor,
} from "../../lib/matching"

const childrenBoundary: BoundaryDefinition = {
  key: "children",
  label: "children plans",
  compare: (source, candidate) => source.value === candidate.value
    ? { outcome: "satisfied" }
    : { outcome: "conflict", reason: "Your stated hard boundaries for children plans conflict." },
}

const strongFactor: MatchingFactor = {
  id: "shared_goal",
  label: "Shared goal",
  importance: "high",
  weight: 3,
  score: 0.9,
  evidence: "known_compatible",
  explanation: "Your stated goals align strongly.",
}

describe("common eligibility", () => {
  it("does not allow a user to match with themself", () => {
    expect(evaluateEligibility({ sourceUserId: "a", candidateUserId: "a" }).eligible).toBe(false)
  })

  it("does not allow blocked users to match", () => {
    const result = evaluateEligibility({ sourceUserId: "a", candidateUserId: "b", sourceBlockedUserIds: ["b"] })
    expect(result.eligible).toBe(false)
    expect(result.failures[0]?.id).toBe("not_blocked")
  })

  it("accepts mode-specific eligibility rules without embedding mode rules", () => {
    const result = evaluateEligibility({
      sourceUserId: "a",
      candidateUserId: "b",
      modeRules: [() => ({ id: "mode_context", eligible: false, reason: "Context is required." })],
    })
    expect(result.eligible).toBe(false)
    expect(result.failures[0]?.reason).toBe("Context is required.")
  })
})

describe("hard boundaries", () => {
  it("blocks a conflicting mutual hard boundary and keeps its reason", () => {
    const checks = evaluateHardBoundaries({
      sourcePreferences: [{ key: "children", value: "wants", isHardBoundary: true }],
      candidatePreferences: [{ key: "children", value: "does_not_want", isHardBoundary: true }],
      definitions: [childrenBoundary],
    })
    expect(checks[0]).toMatchObject({ status: "blocked", blocksEligibility: true })
    expect(checks[0]?.reason).toContain("conflict")
  })

  it("does not block a soft disagreement", () => {
    const checks = evaluateHardBoundaries({
      sourcePreferences: [{ key: "children", value: "wants", isHardBoundary: false }],
      candidatePreferences: [{ key: "children", value: "does_not_want", isHardBoundary: false }],
      definitions: [childrenBoundary],
    })
    expect(checks[0]?.status).toBe("soft_disagreement")
    expect(evaluateEligibility({ sourceUserId: "a", candidateUserId: "b", boundaryChecks: checks }).eligible).toBe(true)
  })

  it("passes matching hard-boundary values", () => {
    const checks = evaluateHardBoundaries({
      sourcePreferences: [{ key: "children", value: "wants", isHardBoundary: true }],
      candidatePreferences: [{ key: "children", value: "wants", isHardBoundary: true }],
      definitions: [childrenBoundary],
    })
    expect(checks[0]).toMatchObject({ status: "passed", blocksEligibility: false })
  })
})

describe("confidence", () => {
  it("reports high confidence when all applicable data is known", () => {
    const result = calculateConfidence([strongFactor, { ...strongFactor, id: "availability", label: "Availability", importance: "medium" }])
    expect(result.level).toBe("high")
    expect(result.score).toBe(1)
  })

  it("reduces confidence more for missing high-value evidence than low-value evidence", () => {
    const lowMissing = calculateConfidence([strongFactor, { ...strongFactor, id: "low", importance: "low", evidence: "not_answered" }])
    const highMissing = calculateConfidence([{ ...strongFactor, importance: "low" }, { ...strongFactor, id: "high", importance: "high", evidence: "not_answered" }])
    expect(highMissing.score).toBeLessThan(lowMissing.score)
  })

  it("treats prefer-not-to-answer as uncertainty, not incompatibility", () => {
    const result = calculateConfidence([
      {
        id: "shared_goal",
        label: "Shared goal",
        importance: "high",
        evidence: "prefer_not_to_answer",
      },
    ])
    expect(result.missing[0]?.state).toBe("prefer_not_to_answer")
    expect(result.score).toBe(0)
  })
})

describe("weighted scoring", () => {
  it("clamps supplied scores to the normalized range", () => {
    const result = calculateWeightedScore([{ ...strongFactor, id: "low", score: -3, weight: 1 }, { ...strongFactor, id: "high", score: 5, weight: 1 }])
    expect(result.score).toBe(0.5)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it("does not convert missing evidence into a zero score", () => {
    const result = calculateWeightedScore([{ ...strongFactor, score: 0.8, weight: 2 }, { ...strongFactor, id: "unknown", score: null, weight: 2, evidence: "not_answered" }])
    expect(result.score).toBe(0.8)
    expect(result.unavailableFactorIds).toContain("unknown")
  })

  it("uses weights supplied by the mode", () => {
    const result = calculateWeightedScore([{ ...strongFactor, id: "high-weight", score: 1, weight: 3 }, { ...strongFactor, id: "low-weight", score: 0, weight: 1 }])
    expect(result.score).toBe(0.75)
  })
})

describe("result explanations", () => {
  it("returns strong reasons and missing-data uncertainties", () => {
    const score = calculateWeightedScore([strongFactor])
    const confidence = calculateConfidence([strongFactor, { ...strongFactor, id: "availability", label: "Availability", evidence: "not_answered", score: null }])
    const explanation = buildMatchExplanation({ eligibility: evaluateEligibility({ sourceUserId: "a", candidateUserId: "b" }), boundaryChecks: [], scoring: score, confidence })
    expect(explanation.reasons).toContain("Your stated goals align strongly.")
    expect(explanation.uncertainties.join(" ")).toContain("Availability")
  })

  it("does not calculate a score for a boundary-ineligible candidate", () => {
    const result = buildMatchingResult({
      sourceUserId: "a",
      candidateUserId: "b",
      scoringFactors: [strongFactor],
      boundaryChecks: [{ key: "children", label: "children plans", status: "blocked", blocksEligibility: true, reason: "Your stated hard boundaries conflict." }],
    })
    expect(result.eligible).toBe(false)
    expect(result.score).toBeNull()
    expect(result.explanations.reasons).toContain("Your stated hard boundaries conflict.")
  })
})

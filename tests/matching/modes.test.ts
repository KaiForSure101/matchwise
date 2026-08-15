import { describe, expect, it } from "vitest"

import { evaluateModeMatch, type DiscoveryPerson } from "../../lib/matching/modes"

const source: DiscoveryPerson = {
  id: "source", displayName: "Ari", username: null, location: "Yangon", avatarUrl: null,
  context: { looking_for: "long-term", goal: "learn", relationship_intent: "long-term", relationship_structure: "monogamous", study_subject: "Python", study_relationship_type: "accountability", role_preference: "designer" },
  preferences: [], interests: ["Hiking", "Design"], skills: [{ name: "Python", level: "beginner", canTeach: false, wantsToLearn: true }], availability: ["evening"],
}
const candidate: DiscoveryPerson = {
  id: "candidate", displayName: "Bea", username: null, location: "Yangon", avatarUrl: null,
  context: { looking_for: "long-term", goal: "learn", relationship_intent: "long-term", relationship_structure: "monogamous", study_subject: "Python", study_relationship_type: "accountability", role_preference: "backend" },
  preferences: [], interests: ["Hiking", "Python"], skills: [{ name: "Python", level: "advanced", canTeach: true, wantsToLearn: false }], availability: ["evening"],
}

describe("mode matching", () => {
  it.each(["dating", "friends", "study", "teams"] as const)("evaluates %s with its own configuration", (mode) => {
    expect(evaluateModeMatch(mode, source, candidate).eligible).toBe(true)
  })
  it("gives the same two people different mode results", () => {
    const dating = evaluateModeMatch("dating", source, candidate)
    const teams = evaluateModeMatch("teams", source, candidate)
    expect(dating.reasons).not.toEqual(teams.reasons)
  })
  it("preserves Phase 3 hard-boundary eligibility", () => {
    const result = evaluateModeMatch("dating", { ...source, preferences: [{ key: "children", value: "yes", isHardBoundary: true }] }, { ...candidate, preferences: [{ key: "children", value: "no", isHardBoundary: true }] })
    expect(result.eligible).toBe(false)
  })
  it("does not make incomplete data ineligible", () => {
    const result = evaluateModeMatch("friends", { ...source, interests: [], availability: [] }, { ...candidate, interests: [], availability: [] })
    expect(result.eligible).toBe(true)
    expect(result.confidence).toBe("low")
  })
})

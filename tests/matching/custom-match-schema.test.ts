import { describe, expect, it } from "vitest"

import { parseCustomCriteria } from "../../lib/custom-match/schema"

describe("custom match schema", () => {
  it("accepts common flat-key output from a natural-language AI interpretation", () => {
    const result = parseCustomCriteria({
      mode: "dating",
      objective: "Find someone serious and in the same city",
      skills: ["python"],
      availability: ["weekends"],
      explanation: "Focus on skills and weekend availability.",
    })

    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.mode).toBe("dating")
      expect(result.data.criteria.some((criterion) => criterion.key === "skills")).toBe(true)
      expect(result.data.criteria.some((criterion) => criterion.key === "availability")).toBe(true)
      expect(result.data.requestedSkills).toContain("python")
    }
  })

  it("rejects unsupported fields from the AI output", () => {
    const result = parseCustomCriteria({
      mode: "dating",
      objective: "Find someone attractive",
      criteria: [{ key: "skills", operator: "includes", value: ["python"], importance: "high", hard: false }],
      beauty_score: 95,
    })

    expect(result.success).toBe(false)
  })
})

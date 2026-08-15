import { z } from "zod"

export const SUPPORTED_CUSTOM_MODES = ["dating", "friends", "study", "teams"] as const
export const CUSTOM_IMPORTANCE_LEVELS = ["required", "high", "medium", "low"] as const
export const CUSTOM_CRITERION_KEYS = [
  "skills",
  "availability",
  "interests",
  "roles",
  "goal",
  "study_subject",
  "relationship_intent",
  "location",
] as const
export const CUSTOM_OPERATORS = [
  "equals",
  "includes",
  "contains",
  "available_on",
  "has_skill",
  "has_interest",
  "matches",
] as const

export const customCriterionSchema = z
  .object({
    key: z.enum(CUSTOM_CRITERION_KEYS),
    operator: z.enum(CUSTOM_OPERATORS),
    value: z.union([z.string(), z.number(), z.array(z.string())]),
    importance: z.enum(CUSTOM_IMPORTANCE_LEVELS).default("medium"),
    hard: z.boolean().default(false),
  })
  .strict()

export const customMatchCriteriaSchema = z
  .object({
    mode: z.enum(SUPPORTED_CUSTOM_MODES),
    objective: z.string().min(1).max(250),
    candidateType: z.enum(["person", "team"]).default("person"),
    criteria: z.array(customCriterionSchema).min(1),
    requestedSkills: z.array(z.string()).default([]),
    availabilityRequirements: z.array(z.string()).default([]),
    teamSize: z.number().int().positive().optional(),
    explanation: z.string().max(500).default(""),
  })
  .strict()

export type CustomMatchCriteria = z.infer<typeof customMatchCriteriaSchema>
export type CustomMatchCriterion = z.infer<typeof customCriterionSchema>

function normalizeFlatCriteriaInput(input: Record<string, unknown>) {
  const next: Record<string, unknown> = { ...input }

  if (typeof next.mode === "string" && next.mode === "team") {
    next.mode = "teams"
  }

  if (!next.candidateType) {
    next.candidateType = "person"
  }

  if (typeof next.objective !== "string" && typeof next.explanation === "string") {
    next.objective = next.explanation
  }

  const flatKeys = [
    "skills",
    "availability",
    "interests",
    "roles",
    "goal",
    "study_subject",
    "relationship_intent",
    "location",
  ] as const

  const flatCriteria = flatKeys.flatMap((key) => {
    if (!(key in next) || next[key] === undefined || next[key] === null) return []

    const value = next[key]

    if (!Array.isArray(next.requestedSkills) && key === "skills" && Array.isArray(value)) {
      next.requestedSkills = value.map((item) => String(item))
    }

    if (!Array.isArray(next.availabilityRequirements) && key === "availability" && Array.isArray(value)) {
      next.availabilityRequirements = value.map((item) => String(item))
    }

    const criterion: Record<string, unknown> = {
      key,
      operator:
        key === "skills" ? "includes"
        : key === "availability" ? "available_on"
        : key === "interests" ? "has_interest"
        : "equals",
      value: Array.isArray(value) ? value.map((item) => String(item)) : String(value),
      importance: typeof next.importance === "string" && CUSTOM_IMPORTANCE_LEVELS.includes(next.importance as (typeof CUSTOM_IMPORTANCE_LEVELS)[number]) ? next.importance : "medium",
      hard: typeof next.hard === "boolean" ? next.hard : false,
    }

    delete next[key]
    return [criterion]
  })

  if (flatCriteria.length > 0 && !Array.isArray(next.criteria)) {
    next.criteria = flatCriteria
  }

  for (const key of flatKeys) {
    delete next[key]
  }

  return next
}

export function parseCustomCriteria(input: unknown) {
  try {
    const normalized = typeof input === "object" && input !== null && !Array.isArray(input)
      ? normalizeFlatCriteriaInput(input as Record<string, unknown>)
      : input

    return { success: true as const, data: customMatchCriteriaSchema.parse(normalized) }
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues.map((issue) => issue.message).join("; ")
        : "The AI response could not be validated as supported Matchwise criteria."
    return { success: false as const, error: message }
  }
}

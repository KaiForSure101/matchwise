import type { MatchMode } from "../constants/modes"

export type MatchingImportance = "low" | "medium" | "high"

/** Only known states can affect quality. Other states reduce confidence or are excluded. */
export type EvidenceState =
  | "known_compatible"
  | "known_incompatible"
  | "unknown"
  | "dont_know"
  | "not_answered"
  | "prefer_not_to_answer"
  | "not_applicable"

export type MatchingFactor = {
  id: string
  label: string
  importance: MatchingImportance
  weight: number
  score: number | null
  evidence: EvidenceState
  explanation?: string
}

export type BoundaryPreference = { key: string; value: string; isHardBoundary: boolean }
export type BoundaryComparison = {
  outcome: "satisfied" | "conflict" | "unknown"
  reason?: string
}

/** Mode code defines the meaning of preference values; the common core does not. */
export type BoundaryDefinition = {
  key: string
  label: string
  compare: (source: BoundaryPreference, candidate: BoundaryPreference) => BoundaryComparison
}

export type HardBoundaryCheck = {
  key: string
  label: string
  status: "passed" | "blocked" | "soft_disagreement" | "unknown" | "not_applicable"
  blocksEligibility: boolean
  reason: string | null
}

export type EligibilityCheck = { id: string; eligible: boolean; reason: string }
export type EligibilityRuleContext = { sourceUserId: string; candidateUserId: string; mode?: MatchMode }
export type EligibilityRule = (context: EligibilityRuleContext) => EligibilityCheck
export type EligibilityResult = { eligible: boolean; checks: EligibilityCheck[]; failures: EligibilityCheck[] }

export type ConfidenceFactor = Pick<MatchingFactor, "id" | "label" | "importance" | "evidence">
export type MissingEvidence = {
  id: string
  label: string
  importance: MatchingImportance
  state: Exclude<EvidenceState, "known_compatible" | "known_incompatible" | "not_applicable">
}
export type ConfidenceResult = {
  level: "low" | "moderate" | "high"
  /** Internal evidence coverage, never a compatibility percentage. */
  score: number
  factorsConsidered: number
  availableFactors: number
  missing: MissingEvidence[]
  explanation: string
}

export type WeightedScoreResult = {
  score: number | null
  availableWeight: number
  totalSuppliedWeight: number
  factors: Array<MatchingFactor & { normalizedScore: number | null; included: boolean }>
  unavailableFactorIds: string[]
}

export type MatchExplanation = { reasons: string[]; uncertainties: string[]; eligibilitySummary: string }

export type MatchingResult = {
  algorithmVersion: string
  mode?: MatchMode
  eligible: boolean
  eligibility: EligibilityResult
  boundaryChecks: HardBoundaryCheck[]
  score: number | null
  confidence: ConfidenceResult
  factors: WeightedScoreResult["factors"]
  explanations: MatchExplanation
}

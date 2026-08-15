import type { MatchMode } from "../constants/modes"
import { MATCHWISE_MATCH_ALGORITHM_VERSION } from "./config"
import { calculateConfidence } from "./confidence"
import { evaluateEligibility } from "./eligibility"
import { buildMatchExplanation } from "./explanations"
import { calculateWeightedScore } from "./scoring"
import type { ConfidenceFactor, EligibilityCheck, EligibilityRule, HardBoundaryCheck, MatchingFactor, MatchingResult } from "./types"

/** Mode engines calculate their own factors and boundary checks before calling this. */
export function buildMatchingResult(input: {
  sourceUserId: string
  candidateUserId: string
  mode?: MatchMode
  sourceBlockedUserIds?: readonly string[]
  candidateBlockedUserIds?: readonly string[]
  requiredChecks?: readonly EligibilityCheck[]
  modeRules?: readonly EligibilityRule[]
  boundaryChecks?: readonly HardBoundaryCheck[]
  scoringFactors: readonly MatchingFactor[]
  confidenceFactors?: readonly ConfidenceFactor[]
  algorithmVersion?: string
}): MatchingResult {
  const boundaryChecks = [...(input.boundaryChecks ?? [])]
  const eligibility = evaluateEligibility({
    sourceUserId: input.sourceUserId,
    candidateUserId: input.candidateUserId,
    sourceBlockedUserIds: input.sourceBlockedUserIds,
    candidateBlockedUserIds: input.candidateBlockedUserIds,
    requiredChecks: input.requiredChecks,
    modeRules: input.modeRules,
    boundaryChecks,
    mode: input.mode,
  })
  const confidence = calculateConfidence(input.confidenceFactors ?? input.scoringFactors)
  const scoring = eligibility.eligible ? calculateWeightedScore(input.scoringFactors) : calculateWeightedScore([])
  const explanations = buildMatchExplanation({ eligibility, boundaryChecks, scoring, confidence })
  return {
    algorithmVersion: input.algorithmVersion ?? MATCHWISE_MATCH_ALGORITHM_VERSION,
    mode: input.mode,
    eligible: eligibility.eligible,
    eligibility,
    boundaryChecks,
    score: scoring.score,
    confidence,
    factors: scoring.factors,
    explanations,
  }
}

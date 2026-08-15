import { MATCHING_THRESHOLDS } from "./config"
import type { ConfidenceResult, EligibilityResult, HardBoundaryCheck, MatchExplanation, WeightedScoreResult } from "./types"

function uncertaintyForState(state: ConfidenceResult["missing"][number]["state"], label: string) {
  switch (state) {
    case "prefer_not_to_answer": return `${label} was intentionally kept private.`
    case "dont_know": return `${label} is still undecided.`
    case "not_answered": return `${label} has not been answered yet.`
    default: return `${label} is not currently known.`
  }
}

export function buildMatchExplanation(input: {
  eligibility: EligibilityResult
  boundaryChecks: readonly HardBoundaryCheck[]
  scoring: WeightedScoreResult
  confidence: ConfidenceResult
}): MatchExplanation {
  const blockedReasons = input.eligibility.failures.map((failure) => failure.reason)
  const reasons = input.scoring.factors
    .filter((factor) => factor.included && factor.normalizedScore !== null && factor.normalizedScore >= MATCHING_THRESHOLDS.explanation.strongFactor && Boolean(factor.explanation))
    .map((factor) => factor.explanation as string)
  const boundaryUncertainties = input.boundaryChecks
    .filter((check) => check.status === "unknown" && check.reason)
    .map((check) => check.reason as string)
  return {
    reasons: input.eligibility.eligible ? reasons : blockedReasons,
    uncertainties: [...input.confidence.missing.map((item) => uncertaintyForState(item.state, item.label)), ...boundaryUncertainties],
    eligibilitySummary: input.eligibility.eligible ? "This candidate passed the shared eligibility checks." : "This candidate did not pass the shared eligibility checks.",
  }
}

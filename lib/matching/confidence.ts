import { IMPORTANCE_WEIGHTS, MATCHING_THRESHOLDS } from "./config"
import { isKnownEvidence, isMissingEvidence } from "./evidence"
import type { ConfidenceFactor, ConfidenceResult, MissingEvidence } from "./types"

export function calculateConfidence(factors: readonly ConfidenceFactor[]): ConfidenceResult {
  let availableWeight = 0
  let consideredWeight = 0
  let availableFactors = 0
  let factorsConsidered = 0
  const missing: MissingEvidence[] = []
  for (const factor of factors) {
    if (factor.evidence === "not_applicable") continue
    const weight = IMPORTANCE_WEIGHTS[factor.importance]
    consideredWeight += weight
    factorsConsidered += 1
    if (isKnownEvidence(factor.evidence)) {
      availableWeight += weight
      availableFactors += 1
    } else if (isMissingEvidence(factor.evidence)) {
      missing.push({ id: factor.id, label: factor.label, importance: factor.importance, state: factor.evidence })
    }
  }
  const score = consideredWeight === 0 ? 0 : availableWeight / consideredWeight
  const level = score >= MATCHING_THRESHOLDS.confidence.high ? "high" : score >= MATCHING_THRESHOLDS.confidence.moderate ? "moderate" : "low"
  return {
    level,
    score,
    factorsConsidered,
    availableFactors,
    missing,
    explanation: missing.length === 0 ? "The available matching evidence covers all applicable factors." : "Some matching evidence is missing or intentionally withheld, so this judgment has less certainty.",
  }
}

import { isKnownEvidence } from "./evidence"
import type { MatchingFactor, WeightedScoreResult } from "./types"

function clamp(value: number) { return Math.min(1, Math.max(0, value)) }

/** Missing evidence is excluded here and accounted for by confidence instead. */
export function calculateWeightedScore(factors: readonly MatchingFactor[]): WeightedScoreResult {
  let weightedTotal = 0
  let availableWeight = 0
  let totalSuppliedWeight = 0
  const unavailableFactorIds: string[] = []
  const normalizedFactors = factors.map((factor) => {
    const weight = Number.isFinite(factor.weight) && factor.weight > 0 ? factor.weight : 0
    totalSuppliedWeight += weight
    const included = isKnownEvidence(factor.evidence) && factor.score !== null && weight > 0
    const normalizedScore = included && factor.score !== null ? clamp(factor.score) : null
    if (normalizedScore !== null) {
      availableWeight += weight
      weightedTotal += normalizedScore * weight
    } else unavailableFactorIds.push(factor.id)
    return { ...factor, normalizedScore, included }
  })
  return { score: availableWeight === 0 ? null : clamp(weightedTotal / availableWeight), availableWeight, totalSuppliedWeight, factors: normalizedFactors, unavailableFactorIds }
}

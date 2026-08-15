/** Shared configuration only; mode engines supply their own factors and weights. */
export const MATCHWISE_MATCH_ALGORITHM_VERSION = "MATCHWISE_MATCH_V1_0" as const

export const IMPORTANCE_WEIGHTS = { low: 1, medium: 2, high: 3 } as const

export const MATCHING_THRESHOLDS = {
  confidence: { moderate: 0.5, high: 0.8 },
  explanation: { strongFactor: 0.7 },
} as const

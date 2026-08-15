import type { EligibilityCheck, EligibilityResult, EligibilityRule, HardBoundaryCheck } from "./types"

export function evaluateEligibility(input: {
  sourceUserId: string
  candidateUserId: string
  sourceBlockedUserIds?: readonly string[]
  candidateBlockedUserIds?: readonly string[]
  boundaryChecks?: readonly HardBoundaryCheck[]
  requiredChecks?: readonly EligibilityCheck[]
  modeRules?: readonly EligibilityRule[]
  mode?: Parameters<EligibilityRule>[0]["mode"]
}): EligibilityResult {
  const checks: EligibilityCheck[] = [
    { id: "not_self", eligible: input.sourceUserId !== input.candidateUserId, reason: "A user cannot be matched with themself." },
    {
      id: "not_blocked",
      eligible: !(input.sourceBlockedUserIds?.includes(input.candidateUserId) || input.candidateBlockedUserIds?.includes(input.sourceUserId)),
      reason: "One of the users has blocked the other.",
    },
    ...(input.requiredChecks ?? []),
  ]
  for (const boundary of input.boundaryChecks ?? []) {
    if (boundary.blocksEligibility) checks.push({ id: `boundary:${boundary.key}`, eligible: false, reason: boundary.reason ?? `${boundary.label} is a hard-boundary conflict.` })
  }
  for (const rule of input.modeRules ?? []) {
    checks.push(rule({ sourceUserId: input.sourceUserId, candidateUserId: input.candidateUserId, mode: input.mode }))
  }
  const failures = checks.filter((check) => !check.eligible)
  return { eligible: failures.length === 0, checks, failures }
}

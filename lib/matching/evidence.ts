import type { EvidenceState } from "./types"

export function isKnownEvidence(state: EvidenceState) {
  return state === "known_compatible" || state === "known_incompatible"
}

export function isMissingEvidence(state: EvidenceState) {
  return !isKnownEvidence(state) && state !== "not_applicable"
}

import type { BoundaryDefinition, BoundaryPreference, HardBoundaryCheck } from "./types"

/** A disagreement blocks only when both people explicitly mark it hard. */
export function evaluateHardBoundaries(input: {
  sourcePreferences: readonly BoundaryPreference[]
  candidatePreferences: readonly BoundaryPreference[]
  definitions: readonly BoundaryDefinition[]
}): HardBoundaryCheck[] {
  return input.definitions.map((definition) => {
    const source = input.sourcePreferences.filter((preference) => preference.key === definition.key)
    const candidate = input.candidatePreferences.filter((preference) => preference.key === definition.key)
    if (source.length === 0 || candidate.length === 0) {
      return { key: definition.key, label: definition.label, status: "unknown", blocksEligibility: false, reason: `${definition.label} is not fully stated by both people.` }
    }

    let sawSoftDisagreement = false
    let sawPass = false
    for (const sourcePreference of source) {
      for (const candidatePreference of candidate) {
        const comparison = definition.compare(sourcePreference, candidatePreference)
        if (comparison.outcome === "conflict") {
          if (sourcePreference.isHardBoundary && candidatePreference.isHardBoundary) {
            return {
              key: definition.key,
              label: definition.label,
              status: "blocked",
              blocksEligibility: true,
              reason: comparison.reason ?? `Your hard boundaries for ${definition.label} conflict.`,
            }
          }
          sawSoftDisagreement = true
        }
        if (comparison.outcome === "satisfied") sawPass = true
      }
    }
    if (sawSoftDisagreement) {
      return { key: definition.key, label: definition.label, status: "soft_disagreement", blocksEligibility: false, reason: `There is a stated difference about ${definition.label}, but it is not a mutual hard-boundary conflict.` }
    }
    if (sawPass) return { key: definition.key, label: definition.label, status: "passed", blocksEligibility: false, reason: null }
    return { key: definition.key, label: definition.label, status: "unknown", blocksEligibility: false, reason: `${definition.label} could not be compared with the available information.` }
  })
}

import { MapPin, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { DiscoveryResult } from "@/lib/matching/modes"

const QUALITY: Record<DiscoveryResult["quality"], string> = { strong: "Strong match", good: "Good match", moderate: "Moderate match", low: "Low match", insufficient: "More context needed" }

export function ResultCard({ result, action }: { result: DiscoveryResult; action?: React.ReactNode }) {
  const { candidate } = result
  return <article className="rounded-2xl border border-[#0f4c45]/10 bg-white/90 p-5 shadow-[0_20px_60px_-48px_rgba(15,76,69,.45)]">
    <div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#0f4c45] font-[family-name:var(--font-display)] text-lg text-white">{candidate.displayName.slice(0, 1).toUpperCase()}</div><div><h2 className="text-lg font-semibold text-[#0f4c45]">{candidate.displayName}</h2>{candidate.location ? <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3" />{candidate.location}</p> : null}</div></div><Badge className="bg-[#0f4c45] text-white">{QUALITY[result.quality]}</Badge></div>
    <div className="mt-4 flex flex-wrap gap-2">{candidate.interests.slice(0, 4).map((interest) => <Badge key={interest} variant="secondary">{interest}</Badge>)}{candidate.skills.slice(0, 3).map((skill) => <Badge key={skill.name} variant="outline">{skill.name}</Badge>)}</div>
    <div className="mt-4 rounded-xl bg-[#0f4c45]/6 p-3"><p className="flex items-center gap-1 text-sm font-medium text-[#0f4c45]"><Sparkles className="size-4" />Why this match</p><p className="mt-1 text-sm text-muted-foreground">{result.reasons[0] ?? "Matchwise needs more shared context for a stronger explanation."}</p></div>
    <div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">Confidence: <span className="font-medium capitalize text-foreground">{result.confidence}</span></p>{action}</div>
    {result.uncertainties[0] ? <p className="mt-3 text-xs text-muted-foreground">Less certain: {result.uncertainties[0]}</p> : null}
  </article>
}

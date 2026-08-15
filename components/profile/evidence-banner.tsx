import { Badge } from "@/components/ui/badge"
import { computeEvidenceLevel } from "@/lib/profile/evidence"
import type { ProfileBundle } from "@/lib/types/profile"

export function EvidenceBanner({ bundle }: { bundle: ProfileBundle }) {
  const evidence = computeEvidenceLevel(bundle)

  return (
    <div className="rounded-2xl border border-[#0f4c45]/10 bg-white/70 px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium text-[#0f4c45]">Matching evidence</p>
        <Badge className="bg-[#0f4c45] text-white hover:bg-[#0f4c45]">
          {evidence.level}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {evidence.filled}/{evidence.total} areas with useful structure
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{evidence.hint}</p>
    </div>
  )
}

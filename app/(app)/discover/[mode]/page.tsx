import Link from "next/link"
import { notFound } from "next/navigation"

import { DatingDeck } from "@/components/matching/dating-deck"
import { ResultCard } from "@/components/matching/result-card"
import { PageIntro } from "@/components/profile/ui-bits"
import { getDiscoveryResults } from "@/lib/actions/discovery"
import { DISCOVERY_MODES } from "@/lib/matching/modes"

export default async function DiscoveryPage({ params }: { params: Promise<{ mode: string }> }) {
  const { mode } = await params
  if (!DISCOVERY_MODES.includes(mode as (typeof DISCOVERY_MODES)[number])) notFound()
  const discoveryMode = mode as (typeof DISCOVERY_MODES)[number]
  const results = await getDiscoveryResults(discoveryMode)
  const title = { dating: "Dating discovery", friends: "Friends connections", study: "Study partners", teams: "Team candidates" }[discoveryMode]
  return <div className="space-y-8"><PageIntro eyebrow="Matchwise modes" title={title} description="Match quality and confidence are separate. Results use only stated, mode-relevant information." /><div className="flex flex-wrap gap-2">{DISCOVERY_MODES.map((item) => <Link key={item} href={`/discover/${item}`} className={item === discoveryMode ? "rounded-lg bg-[#0f4c45] px-3 py-2 text-sm text-white" : "rounded-lg border px-3 py-2 text-sm"}>{item[0].toUpperCase() + item.slice(1)}</Link>)}</div>{discoveryMode === "dating" ? <DatingDeck results={results} /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{results.map((result) => <ResultCard key={result.candidate.id} result={result} />)}{results.length === 0 ? <p className="text-sm text-muted-foreground">No eligible candidates yet. Run the optional fictional demo seed or invite teammates to create profiles.</p> : null}</div>}</div>
}

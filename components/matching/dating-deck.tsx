"use client"

import { Heart, X } from "lucide-react"
import { useState, useTransition } from "react"

import { ResultCard } from "@/components/matching/result-card"
import { Button } from "@/components/ui/button"
import { recordDatingSwipe } from "@/lib/actions/discovery"
import type { DiscoveryResult } from "@/lib/matching/modes"

export function DatingDeck({ results }: { results: DiscoveryResult[] }) {
  const [index, setIndex] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const current = results[index]
  function swipe(action: "like" | "pass") { if (!current) return; startTransition(async () => { const response = await recordDatingSwipe(current.candidate.id, action); if (response.error) setMessage(response.error); else { setMessage(response.matched ? "It's a Match! You both liked each other." : action === "like" ? "Liked." : "Passed."); setIndex((value) => value + 1) } }) }
  if (!current) return <div className="rounded-2xl border border-dashed border-[#0f4c45]/20 bg-white/60 p-10 text-center"><p className="font-[family-name:var(--font-display)] text-xl text-[#0f4c45]">You&apos;re all caught up</p><p className="mt-2 text-sm text-muted-foreground">Add more fictional demo profiles or check back later.</p>{message ? <p className="mt-3 text-sm font-medium text-[#0f4c45]">{message}</p> : null}</div>
  return <div className="mx-auto max-w-md space-y-4"><ResultCard result={current} /><div className="flex justify-center gap-4"><Button aria-label="Pass" variant="outline" size="icon" className="size-14 rounded-full" disabled={pending} onClick={() => swipe("pass")}><X className="size-6" /></Button><Button aria-label="Like" size="icon" className="size-14 rounded-full bg-[#0f4c45] text-white hover:bg-[#0c3d38]" disabled={pending} onClick={() => swipe("like")}><Heart className="size-6" /></Button></div><div className="flex justify-center gap-8 text-sm"><button disabled={pending} onClick={() => swipe("pass")}>Pass</button><button className="font-medium text-[#0f4c45]" disabled={pending} onClick={() => swipe("like")}>Like</button></div>{message ? <p className="text-center text-sm font-medium text-[#0f4c45]">{message}</p> : null}</div>
}

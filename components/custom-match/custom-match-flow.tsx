"use client"

import { useState } from "react"

import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { executeCustomMatch, interpretCustomMatchRequest } from "@/lib/actions/custom-match"
import type { CustomMatchCriteria } from "@/lib/custom-match/schema"

const DEFAULT_PROMPT = "Create a four-person hackathon team. I need strong programming skills, someone good at presenting, and people available on weekends."

export function CustomMatchFlow() {
  const [request, setRequest] = useState(DEFAULT_PROMPT)
  const [criteria, setCriteria] = useState<CustomMatchCriteria | null>(null)
  const [criteriaText, setCriteriaText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Array<{
    candidate: {
      displayName: string
      location: string | null
      interests: string[]
      skills: Array<{ name: string; level: string; canTeach: boolean; wantsToLearn: boolean }>
      availability: string[]
    }
    quality: string
    confidence: string
    reasons: string[]
    criteriaSatisfied: string[]
    missingCriteria: string[]
    score: number
  }> | null>(null)

  async function handleInterpretRequest() {
    setLoading(true)
    setError(null)
    try {
      const response = await interpretCustomMatchRequest(request)
      if ("error" in response) {
        setError(typeof response.error === "string" ? response.error : "The request could not be processed right now.")
        return
      }
      setCriteria(response.criteria)
      setCriteriaText(JSON.stringify(response.criteria, null, 2))
    } catch {
      setError("The request could not be processed right now.")
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove() {
    setLoading(true)
    setError(null)
    try {
      const parsed = JSON.parse(criteriaText) as unknown
      const response = await executeCustomMatch(parsed)
      if ("error" in response) {
        setError(typeof response.error === "string" ? response.error : "The request could not be processed right now.")
        return
      }
      setResults(response.results)
    } catch {
      setError("Please fix the criteria JSON before approving it.")
    } finally {
      setLoading(false)
    }
  }

  function updateCriteriaText(next: string) {
    setCriteriaText(next)
    if (criteria) {
      try {
        const parsed = JSON.parse(next) as CustomMatchCriteria
        setCriteria(parsed)
      } catch {
        // Allow the user to keep editing invalid JSON before approval.
      }
    }
  }

  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Custom Match"
        title="Describe what you're looking for"
        description="DeepSeek interprets your request into structured Matchwise criteria. Matchwise still makes the actual decision using the deterministic matching engine."
      />

      <SectionCard title="Your request">
        <textarea
          value={request}
          onChange={(event) => setRequest(event.target.value)}
          rows={6}
          maxLength={500}
          placeholder="Create a four-person hackathon team. I need strong programming skills, someone good at presenting, and people available on weekends."
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{request.length}/500</p>
          <Button disabled={loading || !request.trim()} onClick={handleInterpretRequest}>
            {loading ? "Interpreting…" : "Interpret request"}
          </Button>
        </div>
      </SectionCard>

      {error ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {criteria ? (
        <SectionCard title="Matchwise AI interpreted your request as">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">Mode: {criteria.mode}</Badge>
              {criteria.teamSize ? <Badge variant="secondary">Team size: {criteria.teamSize}</Badge> : null}
              {criteria.requestedSkills.length ? (
                <Badge variant="secondary">Skills: {criteria.requestedSkills.join(", ")}</Badge>
              ) : null}
            </div>
            <textarea
              value={criteriaText}
              onChange={(event) => updateCriteriaText(event.target.value)}
              rows={14}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setCriteriaText(JSON.stringify(criteria, null, 2))}>
                Reset edits
              </Button>
              <Button onClick={handleApprove} disabled={loading}>
                {loading ? "Finding matches…" : "Approve & find matches"}
              </Button>
            </div>
          </div>
        </SectionCard>
      ) : null}

      {results && results.length > 0 ? (
        <SectionCard title="Custom match results">
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={`${result.candidate.displayName}-${index}`} className="border-[#0f4c45]/10 bg-white/80 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-[#0f4c45]">{result.candidate.displayName}</p>
                    <p className="text-sm text-muted-foreground">{result.candidate.location ?? "Location not shared"}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-[#0f4c45]">{result.quality}</p>
                    <p className="text-muted-foreground">Confidence: {result.confidence}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.candidate.interests.slice(0, 4).map((interest) => (
                    <Badge key={`${result.candidate.displayName}-${interest}`} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                  {result.candidate.skills.slice(0, 4).map((skill) => (
                    <Badge key={`${result.candidate.displayName}-${skill.name}`} variant="outline">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-[#0f4c45]/5 p-3 text-sm text-muted-foreground">
                  <p className="font-medium text-[#0f4c45]">Why this match</p>
                  <p className="mt-1">{result.reasons[0] ?? "Strong alignment with the requested criteria."}</p>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <p>Matched criteria: {result.criteriaSatisfied.join(", ") || "—"}</p>
                  {result.missingCriteria.length ? <p>Missing: {result.missingCriteria.join(", ")}</p> : null}
                </div>
              </Card>
            ))}
          </div>
        </SectionCard>
      ) : null}
    </div>
  )
}

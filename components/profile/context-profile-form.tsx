"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormMessage, NativeSelect } from "@/components/profile/ui-bits"
import { MODE_META, type MatchMode, MATCH_MODES } from "@/lib/constants/modes"
import { upsertContextProfile } from "@/lib/actions/profile"
import type { ContextProfile } from "@/lib/types/profile"

function fieldsFromContext(context: ContextProfile | null | undefined) {
  return {
    lookingFor: context?.looking_for ?? "",
    goal: context?.goal ?? "",
    notes: context?.notes ?? "",
    relationshipIntent: context?.relationship_intent ?? "",
    relationshipStructure: context?.relationship_structure ?? "",
    studySubject: context?.study_subject ?? "",
    studyRelationshipType: context?.study_relationship_type ?? "",
    rolePreference: context?.role_preference ?? "",
    customLabel: context?.custom_label ?? "",
  }
}

export function ContextProfileForm({
  mode,
  context = null,
  contexts,
  allowModeChange = false,
}: {
  mode: MatchMode
  context?: ContextProfile | null
  contexts?: ContextProfile[]
  allowModeChange?: boolean
}) {
  const [currentMode, setCurrentMode] = useState<MatchMode>(mode)
  const resolvedContext =
    contexts?.find((c) => c.mode === currentMode) ??
    (context?.mode === currentMode ? context : null) ??
    null

  return (
    <div className="space-y-4">
      {allowModeChange ? (
        <div className="space-y-2">
          <Label htmlFor="mode">Mode</Label>
          <NativeSelect
            id="mode"
            value={currentMode}
            onChange={(e) => setCurrentMode(e.target.value as MatchMode)}
          >
            {MATCH_MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_META[m].label}
              </option>
            ))}
          </NativeSelect>
        </div>
      ) : null}
      <ContextFields
        key={currentMode}
        mode={currentMode}
        context={resolvedContext}
        showModeLabel={!allowModeChange}
      />
    </div>
  )
}

function ContextFields({
  mode,
  context,
  showModeLabel,
}: {
  mode: MatchMode
  context: ContextProfile | null
  showModeLabel: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const initial = fieldsFromContext(context)
  const [lookingFor, setLookingFor] = useState(initial.lookingFor)
  const [goal, setGoal] = useState(initial.goal)
  const [notes, setNotes] = useState(initial.notes)
  const [relationshipIntent, setRelationshipIntent] = useState(
    initial.relationshipIntent
  )
  const [relationshipStructure, setRelationshipStructure] = useState(
    initial.relationshipStructure
  )
  const [studySubject, setStudySubject] = useState(initial.studySubject)
  const [studyRelationshipType, setStudyRelationshipType] = useState(
    initial.studyRelationshipType
  )
  const [rolePreference, setRolePreference] = useState(initial.rolePreference)
  const [customLabel, setCustomLabel] = useState(initial.customLabel)

  const meta = MODE_META[mode]

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await upsertContextProfile({
        mode,
        lookingFor,
        goal,
        notes,
        relationshipIntent,
        relationshipStructure,
        studySubject,
        studyRelationshipType,
        rolePreference,
        customLabel,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess("Context saved for this mode.")
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {showModeLabel ? (
        <p className="text-sm text-muted-foreground">
          Editing context for{" "}
          <span className="font-medium text-foreground">{meta.label}</span> —{" "}
          {meta.focus}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="lookingFor">What are you looking for?</Label>
        <Input
          id="lookingFor"
          value={lookingFor}
          onValueChange={setLookingFor}
          placeholder="A short description of the connection"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="goal">Primary goal</Label>
        <Input
          id="goal"
          value={goal}
          onValueChange={setGoal}
          placeholder="What success looks like in this mode"
        />
      </div>

      {mode === "dating" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="intent">Relationship intent</Label>
            <Input
              id="intent"
              value={relationshipIntent}
              onValueChange={setRelationshipIntent}
              placeholder="e.g. long-term, exploring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="structure">Relationship structure</Label>
            <Input
              id="structure"
              value={relationshipStructure}
              onValueChange={setRelationshipStructure}
              placeholder="e.g. monogamous"
            />
          </div>
        </div>
      ) : null}

      {mode === "study" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={studySubject}
              onValueChange={setStudySubject}
              placeholder="e.g. Linear algebra"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studyType">Study relationship</Label>
            <Input
              id="studyType"
              value={studyRelationshipType}
              onValueChange={setStudyRelationshipType}
              placeholder="e.g. accountability partner"
            />
          </div>
        </div>
      ) : null}

      {mode === "professional" || mode === "teams" ? (
        <div className="space-y-2">
          <Label htmlFor="role">Role preference</Label>
          <Input
            id="role"
            value={rolePreference}
            onValueChange={setRolePreference}
            placeholder="e.g. designer, backend, facilitator"
          />
        </div>
      ) : null}

      {mode === "custom" ? (
        <div className="space-y-2">
          <Label htmlFor="customLabel">Custom label</Label>
          <Input
            id="customLabel"
            value={customLabel}
            onValueChange={setCustomLabel}
            placeholder="Name this custom match purpose"
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything else useful for this mode"
        />
      </div>

      <FormMessage error={error} success={success} />
      <Button
        type="submit"
        disabled={pending}
        className="bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
      >
        {pending ? "Saving…" : "Save context"}
      </Button>
    </form>
  )
}

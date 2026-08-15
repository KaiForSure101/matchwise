"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { FormMessage, NativeSelect } from "@/components/profile/ui-bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ANSWER_STATE_LABELS,
  ANSWER_STATES,
  STARTER_QUESTIONS,
  type AnswerState,
  type MatchMode,
} from "@/lib/constants/modes"
import { upsertAnswer } from "@/lib/actions/data"
import type { Answer } from "@/lib/types/profile"

export function AnswersManager({
  answers,
  activeMode,
}: {
  answers: Answer[]
  activeMode: MatchMode | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const questions = STARTER_QUESTIONS.filter(
    (q) => !q.modes || (activeMode && q.modes.includes(activeMode))
  )

  function save(
    questionKey: string,
    answerValue: string,
    answerState: AnswerState
  ) {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await upsertAnswer({
        questionKey,
        answerValue,
        answerState,
        mode: activeMode ?? "",
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess("Answer saved.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Missing or skipped answers are stored as explicit states — never treated
        as a silent “no” for future matching.
      </p>
      <FormMessage error={error} success={success} />

      <ul className="space-y-5">
        {questions.map((question) => {
          const existing = answers.find(
            (a) =>
              a.question_key === question.key &&
              (a.mode === activeMode || (!a.mode && !activeMode))
          )
          return (
            <AnswerRow
              key={question.key}
              label={question.label}
              questionKey={question.key}
              existing={existing ?? null}
              pending={pending}
              onSave={save}
            />
          )
        })}
      </ul>
    </div>
  )
}

function AnswerRow({
  label,
  questionKey,
  existing,
  pending,
  onSave,
}: {
  label: string
  questionKey: string
  existing: Answer | null
  pending: boolean
  onSave: (key: string, value: string, state: AnswerState) => void
}) {
  const [value, setValue] = useState(existing?.answer_value ?? "")
  const [state, setState] = useState<AnswerState>(
    existing?.answer_state ?? "not_answered"
  )

  return (
    <li className="space-y-3 rounded-xl border border-[#0f4c45]/10 bg-white/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-[#0f4c45]">{label}</p>
        {existing ? (
          <Badge variant="secondary">
            {ANSWER_STATE_LABELS[existing.answer_state]}
          </Badge>
        ) : (
          <Badge variant="outline">Not saved yet</Badge>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
        <div className="space-y-2">
          <Label htmlFor={`val-${questionKey}`}>Answer value</Label>
          <Input
            id={`val-${questionKey}`}
            value={value}
            onValueChange={setValue}
            disabled={state !== "answered"}
            placeholder={
              state === "answered"
                ? "Your answer"
                : "Only used when state is Answered"
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`state-${questionKey}`}>State</Label>
          <NativeSelect
            id={`state-${questionKey}`}
            value={state}
            onChange={(e) => setState(e.target.value as AnswerState)}
          >
            {ANSWER_STATES.map((s) => (
              <option key={s} value={s}>
                {ANSWER_STATE_LABELS[s]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            size="sm"
            disabled={pending}
            className="bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
            onClick={() => onSave(questionKey, value, state)}
          >
            Save
          </Button>
        </div>
      </div>
    </li>
  )
}

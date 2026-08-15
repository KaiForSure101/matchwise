"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { FormMessage, NativeSelect } from "@/components/profile/ui-bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  IMPORTANCE_LEVELS,
  MODE_META,
  MATCH_MODES,
  type ImportanceLevel,
  type MatchMode,
} from "@/lib/constants/modes"
import { createPreference, deletePreference } from "@/lib/actions/data"
import type { Preference } from "@/lib/types/profile"

export function PreferencesManager({
  preferences,
  defaultMode,
}: {
  preferences: Preference[]
  defaultMode: MatchMode | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [key, setKey] = useState("")
  const [value, setValue] = useState("")
  const [importance, setImportance] = useState<ImportanceLevel>("medium")
  const [hardBoundary, setHardBoundary] = useState(false)
  const [mode, setMode] = useState<MatchMode | "">(defaultMode ?? "")

  function onAdd(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await createPreference({
        preferenceKey: key,
        preferenceValue: value,
        importance,
        isHardBoundary: hardBoundary,
        mode,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setKey("")
      setValue("")
      setHardBoundary(false)
      setSuccess("Preference saved.")
      router.refresh()
    })
  }

  function onDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deletePreference(id)
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onAdd} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prefKey">Preference</Label>
            <Input
              id="prefKey"
              value={key}
              onValueChange={setKey}
              placeholder="e.g. Children"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prefValue">Value</Label>
            <Input
              id="prefValue"
              value={value}
              onValueChange={setValue}
              placeholder="e.g. Wants children"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="importance">Importance</Label>
            <NativeSelect
              id="importance"
              value={importance}
              onChange={(e) =>
                setImportance(e.target.value as ImportanceLevel)
              }
            >
              {IMPORTANCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prefMode">Mode (optional)</Label>
            <NativeSelect
              id="prefMode"
              value={mode}
              onChange={(e) => setMode(e.target.value as MatchMode | "")}
            >
              <option value="">Any / general</option>
              {MATCH_MODES.map((m) => (
                <option key={m} value={m}>
                  {MODE_META[m].label}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#0f4c45]/10 bg-[#0f4c45]/[0.03] px-4 py-3">
          <div>
            <p className="text-sm font-medium">Hard boundary</p>
            <p className="text-xs text-muted-foreground">
              Must be satisfied later — not just desirable.
            </p>
          </div>
          <Switch
            checked={hardBoundary}
            onCheckedChange={setHardBoundary}
            aria-label="Hard boundary"
          />
        </div>
        <FormMessage error={error} success={success} />
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
        >
          {pending ? "Saving…" : "Add preference"}
        </Button>
      </form>

      <ul className="space-y-3">
        {preferences.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            No preferences yet. Add what matters for your current mode.
          </li>
        ) : (
          preferences.map((pref) => (
            <li
              key={pref.id}
              className="flex flex-col gap-3 rounded-xl border border-[#0f4c45]/10 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-[#0f4c45]">
                  {pref.preference_key}
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    → {pref.preference_value}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Importance: {pref.importance}
                  </Badge>
                  {pref.is_hard_boundary ? (
                    <Badge>Hard boundary</Badge>
                  ) : (
                    <Badge variant="outline">Preference</Badge>
                  )}
                  {pref.mode ? (
                    <Badge variant="outline">{MODE_META[pref.mode].label}</Badge>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => onDelete(pref.id)}
              >
                Remove
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

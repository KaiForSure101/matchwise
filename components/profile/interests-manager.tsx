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
  INVOLVEMENT_LABELS,
  INVOLVEMENT_LEVELS,
  type InvolvementLevel,
} from "@/lib/constants/modes"
import { createInterest, deleteInterest } from "@/lib/actions/data"
import type { Interest } from "@/lib/types/profile"

export function InterestsManager({ interests }: { interests: Interest[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [involvement, setInvolvement] =
    useState<InvolvementLevel>("interested")
  const [wantsShared, setWantsShared] = useState(false)

  function onAdd(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await createInterest({
        name,
        category,
        involvement,
        wantsShared,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setName("")
      setCategory("")
      setWantsShared(false)
      setSuccess("Interest added.")
      router.refresh()
    })
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteInterest(id)
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
            <Label htmlFor="interestName">Interest</Label>
            <Input
              id="interestName"
              value={name}
              onValueChange={setName}
              placeholder="e.g. Climbing"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category (optional)</Label>
            <Input
              id="category"
              value={category}
              onValueChange={setCategory}
              placeholder="e.g. Outdoors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="involvement">Involvement</Label>
          <NativeSelect
            id="involvement"
            value={involvement}
            onChange={(e) =>
              setInvolvement(e.target.value as InvolvementLevel)
            }
          >
            {INVOLVEMENT_LEVELS.map((level) => (
              <option key={level} value={level}>
                {INVOLVEMENT_LABELS[level]}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#0f4c45]/10 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Want someone to share this?</p>
            <p className="text-xs text-muted-foreground">
              Useful signal for Friends and Activities later.
            </p>
          </div>
          <Switch
            checked={wantsShared}
            onCheckedChange={setWantsShared}
            aria-label="Want shared interest"
          />
        </div>
        <FormMessage error={error} success={success} />
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
        >
          {pending ? "Adding…" : "Add interest"}
        </Button>
      </form>

      <ul className="space-y-3">
        {interests.length === 0 ? (
          <li className="text-sm text-muted-foreground">No interests yet.</li>
        ) : (
          interests.map((interest) => (
            <li
              key={interest.id}
              className="flex flex-col gap-3 rounded-xl border border-[#0f4c45]/10 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-[#0f4c45]">{interest.name}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {INVOLVEMENT_LABELS[interest.involvement]}
                  </Badge>
                  {interest.category ? (
                    <Badge variant="outline">{interest.category}</Badge>
                  ) : null}
                  {interest.wants_shared ? (
                    <Badge>Wants shared</Badge>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => onDelete(interest.id)}
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

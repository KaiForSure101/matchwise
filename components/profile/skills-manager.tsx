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
  SKILL_LEVEL_LABELS,
  SKILL_LEVELS,
  type SkillLevel,
} from "@/lib/constants/modes"
import { createSkill, deleteSkill } from "@/lib/actions/data"
import type { Skill } from "@/lib/types/profile"

export function SkillsManager({ skills }: { skills: Skill[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [level, setLevel] = useState<SkillLevel>("beginner")
  const [canTeach, setCanTeach] = useState(false)
  const [wantsToLearn, setWantsToLearn] = useState(false)

  function onAdd(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await createSkill({
        name,
        level,
        canTeach,
        wantsToLearn,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      setName("")
      setCanTeach(false)
      setWantsToLearn(false)
      setSuccess("Skill added.")
      router.refresh()
    })
  }

  function onDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSkill(id)
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
            <Label htmlFor="skillName">Skill</Label>
            <Input
              id="skillName"
              value={name}
              onValueChange={setName}
              placeholder="e.g. Python"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skillLevel">Level</Label>
            <NativeSelect
              id="skillLevel"
              value={level}
              onChange={(e) => setLevel(e.target.value as SkillLevel)}
            >
              {SKILL_LEVELS.map((item) => (
                <option key={item} value={item}>
                  {SKILL_LEVEL_LABELS[item]}
                </option>
              ))}
            </NativeSelect>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[#0f4c45]/10 px-4 py-3">
            <p className="text-sm font-medium">Can teach</p>
            <Switch
              checked={canTeach}
              onCheckedChange={setCanTeach}
              aria-label="Can teach"
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[#0f4c45]/10 px-4 py-3">
            <p className="text-sm font-medium">Wants to learn</p>
            <Switch
              checked={wantsToLearn}
              onCheckedChange={setWantsToLearn}
              aria-label="Wants to learn"
            />
          </div>
        </div>
        <FormMessage error={error} success={success} />
        <Button
          type="submit"
          disabled={pending}
          className="bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
        >
          {pending ? "Adding…" : "Add skill"}
        </Button>
      </form>

      <ul className="space-y-3">
        {skills.length === 0 ? (
          <li className="text-sm text-muted-foreground">No skills yet.</li>
        ) : (
          skills.map((skill) => (
            <li
              key={skill.id}
              className="flex flex-col gap-3 rounded-xl border border-[#0f4c45]/10 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-[#0f4c45]">{skill.name}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {SKILL_LEVEL_LABELS[skill.level]}
                  </Badge>
                  {skill.can_teach ? <Badge>Can teach</Badge> : null}
                  {skill.wants_to_learn ? (
                    <Badge variant="outline">Wants to learn</Badge>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => onDelete(skill.id)}
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

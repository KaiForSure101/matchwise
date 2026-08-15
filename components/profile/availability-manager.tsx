"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { FormMessage } from "@/components/profile/ui-bits"
import { Button } from "@/components/ui/button"
import {
  AVAILABILITY_BLOCKS,
  AVAILABILITY_LABELS,
  type AvailabilityBlock,
} from "@/lib/constants/modes"
import { setAvailabilityBlocks } from "@/lib/actions/data"
import type { Availability } from "@/lib/types/profile"
import { cn } from "@/lib/utils"

export function AvailabilityManager({
  availability,
}: {
  availability: Availability[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selected, setSelected] = useState<AvailabilityBlock[]>(
    availability.map((a) => a.block)
  )

  function toggle(block: AvailabilityBlock) {
    setSelected((prev) =>
      prev.includes(block) ? prev.filter((b) => b !== block) : [...prev, block]
    )
  }

  function onSave() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await setAvailabilityBlocks(selected)
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess("Availability saved.")
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pick the blocks when you are generally free. No calendars — just simple
        signals for later matching.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {AVAILABILITY_BLOCKS.map((block) => {
          const active = selected.includes(block)
          return (
            <button
              key={block}
              type="button"
              onClick={() => toggle(block)}
              className={cn(
                "rounded-xl border px-4 py-4 text-left transition-colors",
                active
                  ? "border-[#0f4c45]/40 bg-[#0f4c45]/10 text-[#0f4c45]"
                  : "border-[#0f4c45]/10 bg-white/70 text-foreground hover:border-[#0f4c45]/25"
              )}
            >
              <p className="font-medium">{AVAILABILITY_LABELS[block]}</p>
              <p className="text-xs text-muted-foreground">
                {active ? "Selected" : "Tap to select"}
              </p>
            </button>
          )
        })}
      </div>
      <FormMessage error={error} success={success} />
      <Button
        type="button"
        disabled={pending}
        onClick={onSave}
        className="bg-[#0f4c45] text-white hover:bg-[#0c3d38]"
      >
        {pending ? "Saving…" : "Save availability"}
      </Button>
    </div>
  )
}

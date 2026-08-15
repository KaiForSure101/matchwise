"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FormMessage } from "@/components/profile/ui-bits"
import { updateBasicProfile } from "@/lib/actions/profile"
import type { Profile } from "@/lib/types/profile"

export function BasicProfileForm({
  profile,
  redirectTo,
}: {
  profile: Profile | null
  redirectTo?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "")
  const [username, setUsername] = useState(profile?.username ?? "")
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? "")
  const [locationText, setLocationText] = useState(profile?.location_text ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await updateBasicProfile({
        displayName,
        username,
        dateOfBirth,
        locationText,
        bio,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess("Saved. You can edit this anytime.")
      if (redirectTo) {
        router.push(redirectTo)
        router.refresh()
      } else {
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          onValueChange={setDisplayName}
          placeholder="How should Matchwise greet you?"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onValueChange={setUsername}
          placeholder="lowercase_letters_ok"
        />
        <p className="text-xs text-muted-foreground">
          3–24 characters: lowercase letters, numbers, underscores.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dob">Birthday</Label>
          <Input
            id="dob"
            type="date"
            value={dateOfBirth}
            onValueChange={setDateOfBirth}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Approximate location</Label>
          <Input
            id="location"
            value={locationText}
            onValueChange={setLocationText}
            placeholder="City or region"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Short bio (optional)</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A sentence or two about what you're looking to create."
          rows={3}
        />
      </div>
      <FormMessage error={error} success={success} />
      <Button type="submit" disabled={pending} className="bg-[#0f4c45] text-white hover:bg-[#0c3d38]">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  )
}

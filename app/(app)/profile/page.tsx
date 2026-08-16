import Link from "next/link"

import { EvidenceBanner } from "@/components/profile/evidence-banner"
import { PageIntro, SectionCard } from "@/components/profile/ui-bits"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  AVAILABILITY_LABELS,
  INVOLVEMENT_LABELS,
  MODE_META,
  SKILL_LEVEL_LABELS,
} from "@/lib/constants/modes"
import { getProfileBundle } from "@/lib/actions/profile"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Profile · Matchwise",
}

export default async function ProfilePage() {
  const bundle = await getProfileBundle()
  const { profile, contextProfiles, preferences, interests, skills, availability } =
    bundle
  const activeMode = profile?.active_mode ?? null
  const activeContext = activeMode
    ? contextProfiles.find((c) => c.mode === activeMode)
    : null

  // Profile completeness: simple heuristic based on key categories
  const completenessCategories = [
    Boolean(profile?.display_name),
    Boolean(profile?.username),
    skills.length > 0,
    interests.length > 0,
    availability.length > 0,
    Boolean(activeContext && (activeContext.looking_for || activeContext.goal || activeContext.notes)),
  ]
  const completenessScore = Math.round((completenessCategories.filter(Boolean).length / completenessCategories.length) * 100)

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-[#0f4c45]/10 bg-white/80 p-4">
        <p className="text-sm font-medium text-[#0f4c45]">Profile completeness</p>
        <div className="mt-2 h-3 w-full rounded-full bg-[#e6f7f5]">
          <div
            className="h-3 rounded-full bg-[#0f4c45]"
            style={{ width: `${completenessScore}%` }}
            aria-hidden
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{completenessScore}% complete — fill the sections below to improve your matches.</p>
      </div>
      <PageIntro
        eyebrow="Your profile"
        title="Structured data for better matching later"
        description="Edit basics, mode context, preferences, interests, skills, and availability. Nothing here calculates compatibility yet."
      />

      <EvidenceBanner bundle={bundle} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Basic profile">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Display name</dt>
              <dd className="font-medium">{profile?.display_name || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Username</dt>
              <dd className="font-medium">{profile?.username || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Birthday</dt>
              <dd className="font-medium">{profile?.date_of_birth || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{profile?.location_text || "—"}</dd>
            </div>
          </dl>
          <Link
            href="/profile/basic"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Edit basics
          </Link>
        </SectionCard>

        <SectionCard title="Current mode">
          {activeMode ? (
            <div className="space-y-2 text-sm">
              <p className="text-lg font-medium text-[#0f4c45]">
                {MODE_META[activeMode].label}
              </p>
              <p className="text-muted-foreground">
                {MODE_META[activeMode].tagline}
              </p>
              {activeContext?.looking_for ? (
                <p>
                  Looking for:{" "}
                  <span className="font-medium">{activeContext.looking_for}</span>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Add context for this mode when you are ready.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No mode selected yet.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/profile/mode"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Change mode
            </Link>
            <Link
              href="/profile/context"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Edit context
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Preferences">
          {preferences.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="space-y-2">
              {preferences.slice(0, 4).map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{p.preference_key}</span>
                  <span className="text-muted-foreground">→ {p.preference_value}</span>
                  {p.is_hard_boundary ? <Badge>Hard boundary</Badge> : null}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/profile/preferences"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Manage preferences
          </Link>
        </SectionCard>

        <SectionCard title="Availability">
          {availability.length === 0 ? (
            <p className="text-sm text-muted-foreground">None selected.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availability.map((a) => (
                <Badge key={a.id} variant="secondary">
                  {AVAILABILITY_LABELS[a.block]}
                </Badge>
              ))}
            </div>
          )}
          <Link
            href="/profile/availability"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Edit availability
          </Link>
        </SectionCard>

        <SectionCard title="Interests">
          {interests.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {interests.slice(0, 5).map((i) => (
                <li key={i.id}>
                  <span className="font-medium">{i.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {INVOLVEMENT_LABELS[i.involvement]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/profile/interests"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Manage interests
          </Link>
        </SectionCard>

        <SectionCard title="Skills">
          {skills.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {skills.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {SKILL_LEVEL_LABELS[s.level]}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/profile/skills"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
          >
            Manage skills
          </Link>
        </SectionCard>
      </div>

      <SectionCard
        title="Answers"
        description="Starter questionnaire with explicit answer states."
      >
        <Link
          href="/profile/answers"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Edit answers
        </Link>
      </SectionCard>
    </div>
  )
}

"use server"

import { revalidatePath } from "next/cache"

import type { MatchMode } from "@/lib/constants/modes"
import { MATCH_MODES } from "@/lib/constants/modes"
import { createClient } from "@/lib/supabase/server"
import type { ProfileBundle } from "@/lib/types/profile"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be signed in.")
  }

  return { supabase, user }
}

function revalidateProfilePaths() {
  revalidatePath("/dashboard")
  revalidatePath("/profile")
  revalidatePath("/onboarding")
}

export async function getProfileBundle(): Promise<ProfileBundle> {
  const { supabase, user } = await requireUser()

  const [
    profileRes,
    contextRes,
    preferencesRes,
    answersRes,
    interestsRes,
    skillsRes,
    availabilityRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("context_profiles").select("*").eq("user_id", user.id),
    supabase
      .from("preferences")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("answers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("interests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("skills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("availability").select("*").eq("user_id", user.id),
  ])

  const firstError =
    profileRes.error ||
    contextRes.error ||
    preferencesRes.error ||
    answersRes.error ||
    interestsRes.error ||
    skillsRes.error ||
    availabilityRes.error

  if (firstError) {
    throw new Error(firstError.message)
  }

  return {
    profile: profileRes.data,
    contextProfiles: contextRes.data ?? [],
    preferences: preferencesRes.data ?? [],
    answers: answersRes.data ?? [],
    interests: interestsRes.data ?? [],
    skills: skillsRes.data ?? [],
    availability: availabilityRes.data ?? [],
  }
}

export async function ensureProfileRow() {
  const { supabase, user } = await requireUser()

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (existing) return

  const metadata = user.user_metadata as {
    display_name?: string
    full_name?: string
    name?: string
  }

  const displayName =
    metadata.display_name ||
    metadata.full_name ||
    metadata.name ||
    user.email?.split("@")[0] ||
    null

  const { error } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
  })

  if (error && error.code !== "23505") {
    throw new Error(error.message)
  }
}

export type BasicProfileInput = {
  displayName: string
  username: string
  dateOfBirth: string
  locationText: string
  bio: string
}

export async function updateBasicProfile(input: BasicProfileInput) {
  const { supabase, user } = await requireUser()
  await ensureProfileRow()

  const username = input.username.trim().toLowerCase() || null
  if (username && !/^[a-z0-9_]{3,24}$/.test(username)) {
    return {
      error:
        "Username must be 3–24 characters using lowercase letters, numbers, or underscores.",
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: input.displayName.trim() || null,
      username,
      date_of_birth: input.dateOfBirth || null,
      location_text: input.locationText.trim() || null,
      bio: input.bio.trim() || null,
    })
    .eq("id", user.id)

  if (error) {
    if (error.code === "23505") {
      return { error: "That username is already taken." }
    }
    return { error: error.message }
  }

  revalidateProfilePaths()
  return { success: true }
}

export async function setActiveMode(mode: MatchMode) {
  if (!MATCH_MODES.includes(mode)) {
    return { error: "Invalid mode." }
  }

  const { supabase, user } = await requireUser()
  await ensureProfileRow()

  const { error } = await supabase
    .from("profiles")
    .update({ active_mode: mode })
    .eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidateProfilePaths()
  return { success: true }
}

export type ContextProfileInput = {
  mode: MatchMode
  lookingFor: string
  goal: string
  notes: string
  relationshipIntent: string
  relationshipStructure: string
  studySubject: string
  studyRelationshipType: string
  rolePreference: string
  customLabel: string
}

export async function upsertContextProfile(input: ContextProfileInput) {
  if (!MATCH_MODES.includes(input.mode)) {
    return { error: "Invalid mode." }
  }

  const { supabase, user } = await requireUser()

  const { error } = await supabase.from("context_profiles").upsert(
    {
      user_id: user.id,
      mode: input.mode,
      looking_for: input.lookingFor.trim() || null,
      goal: input.goal.trim() || null,
      notes: input.notes.trim() || null,
      relationship_intent: input.relationshipIntent.trim() || null,
      relationship_structure: input.relationshipStructure.trim() || null,
      study_subject: input.studySubject.trim() || null,
      study_relationship_type: input.studyRelationshipType.trim() || null,
      role_preference: input.rolePreference.trim() || null,
      custom_label: input.customLabel.trim() || null,
    },
    { onConflict: "user_id,mode" }
  )

  if (error) {
    return { error: error.message }
  }

  revalidateProfilePaths()
  return { success: true }
}

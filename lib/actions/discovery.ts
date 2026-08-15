"use server"

import { revalidatePath } from "next/cache"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { evaluateModeMatch, type DiscoveryMode, type DiscoveryPerson } from "@/lib/matching/modes"

async function currentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("You must be signed in.")
  return user
}

export async function getDiscoveryResults(mode: DiscoveryMode) {
  const user = await currentUser()
  const admin = createAdminClient()
  const [profiles, contexts, preferences, interests, skills, availability, myBlocks, blockedBy] = await Promise.all([
    admin.from("profiles").select("id, display_name, username, location_text, avatar_url").neq("id", user.id),
    admin.from("context_profiles").select("user_id, mode, looking_for, goal, relationship_intent, relationship_structure, study_subject, study_relationship_type, role_preference").eq("mode", mode),
    admin.from("preferences").select("user_id, preference_key, preference_value, is_hard_boundary").or(`mode.eq.${mode},mode.is.null`),
    admin.from("interests").select("user_id, name"),
    admin.from("skills").select("user_id, name, level, can_teach, wants_to_learn"),
    admin.from("availability").select("user_id, block"),
    admin.from("user_blocks").select("blocked_id").eq("blocker_id", user.id),
    admin.from("user_blocks").select("blocker_id").eq("blocked_id", user.id),
  ])
  const errors = [profiles.error, contexts.error, preferences.error, interests.error, skills.error, availability.error, myBlocks.error, blockedBy.error].find(Boolean)
  if (errors) throw new Error(errors.message)
  const profileRows = profiles.data ?? []
  const people = profileRows.map((profile): DiscoveryPerson => ({
    id: profile.id,
    displayName: profile.display_name ?? "Matchwise member",
    username: profile.username,
    location: profile.location_text,
    avatarUrl: profile.avatar_url,
    context: Object.fromEntries((contexts.data ?? []).filter((row) => row.user_id === profile.id).map((row) => ["looking_for", row.looking_for]).concat((contexts.data ?? []).filter((row) => row.user_id === profile.id).flatMap((row) => Object.entries(row).filter(([key]) => !["user_id", "mode", "looking_for", "goal"].includes(key)).map(([key, value]) => [key, value]))).concat((contexts.data ?? []).filter((row) => row.user_id === profile.id).map((row) => ["goal", row.goal]))),
    preferences: (preferences.data ?? []).filter((row) => row.user_id === profile.id).map((row) => ({ key: row.preference_key, value: row.preference_value, isHardBoundary: row.is_hard_boundary })),
    interests: (interests.data ?? []).filter((row) => row.user_id === profile.id).map((row) => row.name),
    skills: (skills.data ?? []).filter((row) => row.user_id === profile.id).map((row) => ({ name: row.name, level: row.level, canTeach: row.can_teach, wantsToLearn: row.wants_to_learn })),
    availability: (availability.data ?? []).filter((row) => row.user_id === profile.id).map((row) => row.block),
  }))
  // The requester is not part of the public profile query; load their private rows separately.
  const sourceProfile = await admin.from("profiles").select("id, display_name, username, location_text, avatar_url").eq("id", user.id).single()
  if (sourceProfile.error) throw new Error(sourceProfile.error.message)
  const sourcePerson: DiscoveryPerson = { id: user.id, displayName: sourceProfile.data.display_name ?? "You", username: sourceProfile.data.username, location: sourceProfile.data.location_text, avatarUrl: sourceProfile.data.avatar_url, context: Object.fromEntries((contexts.data ?? []).filter((row) => row.user_id === user.id).flatMap((row) => Object.entries(row).filter(([key]) => !["user_id", "mode"].includes(key)))), preferences: (preferences.data ?? []).filter((row) => row.user_id === user.id).map((row) => ({ key: row.preference_key, value: row.preference_value, isHardBoundary: row.is_hard_boundary })), interests: (interests.data ?? []).filter((row) => row.user_id === user.id).map((row) => row.name), skills: (skills.data ?? []).filter((row) => row.user_id === user.id).map((row) => ({ name: row.name, level: row.level, canTeach: row.can_teach, wantsToLearn: row.wants_to_learn })), availability: (availability.data ?? []).filter((row) => row.user_id === user.id).map((row) => row.block) }
  const mine = (myBlocks.data ?? []).map((row) => row.blocked_id)
  const theirs = (blockedBy.data ?? []).map((row) => row.blocker_id)
  return people.map((candidate) => evaluateModeMatch(mode, sourcePerson, candidate, mine, theirs)).filter((result) => result.eligible).sort((a, b) => ({ strong: 4, good: 3, moderate: 2, low: 1, insufficient: 0 }[b.quality] - { strong: 4, good: 3, moderate: 2, low: 1, insufficient: 0 }[a.quality]))
}

export async function recordDatingSwipe(targetUserId: string, action: "like" | "pass") {
  const user = await currentUser()
  if (targetUserId === user.id) return { error: "You cannot swipe on yourself." }
  const admin = createAdminClient()
  const { error } = await admin.from("swipes").upsert({ swiper_user_id: user.id, target_user_id: targetUserId, mode: "dating", action }, { onConflict: "swiper_user_id,target_user_id,mode" })
  if (error) return { error: error.message }
  let matched = false
  if (action === "like") {
    const { data: reciprocal } = await admin.from("swipes").select("id").eq("swiper_user_id", targetUserId).eq("target_user_id", user.id).eq("mode", "dating").eq("action", "like").maybeSingle()
    if (reciprocal) {
      const [userA, userB] = [user.id, targetUserId].sort()
      const { error: matchError } = await admin.from("matches").upsert({ user_a_id: userA, user_b_id: userB, mode: "dating" }, { onConflict: "user_a_id,user_b_id,mode", ignoreDuplicates: true })
      if (matchError) return { error: matchError.message }
      matched = true
    }
  }
  revalidatePath("/discover/dating")
  return { success: true, matched }
}

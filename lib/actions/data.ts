"use server"

import { revalidatePath } from "next/cache"

import type {
  AnswerState,
  AvailabilityBlock,
  ImportanceLevel,
  InvolvementLevel,
  MatchMode,
  SkillLevel,
} from "@/lib/constants/modes"
import {
  ANSWER_STATES,
  AVAILABILITY_BLOCKS,
  IMPORTANCE_LEVELS,
  INVOLVEMENT_LEVELS,
  MATCH_MODES,
  SKILL_LEVELS,
} from "@/lib/constants/modes"
import { createClient } from "@/lib/supabase/server"

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

function revalidateAll() {
  revalidatePath("/dashboard")
  revalidatePath("/profile")
  revalidatePath("/onboarding")
}

export async function createPreference(input: {
  preferenceKey: string
  preferenceValue: string
  importance: ImportanceLevel
  isHardBoundary: boolean
  mode: MatchMode | ""
}) {
  const { supabase, user } = await requireUser()

  const key = input.preferenceKey.trim()
  const value = input.preferenceValue.trim()
  if (!key || !value) {
    return { error: "Preference and value are required." }
  }
  if (!IMPORTANCE_LEVELS.includes(input.importance)) {
    return { error: "Invalid importance." }
  }

  const mode =
    input.mode && MATCH_MODES.includes(input.mode as MatchMode)
      ? (input.mode as MatchMode)
      : null

  const { error } = await supabase.from("preferences").insert({
    user_id: user.id,
    preference_key: key,
    preference_value: value,
    importance: input.importance,
    is_hard_boundary: input.isHardBoundary,
    mode,
  })

  if (error) return { error: error.message }
  revalidateAll()
  return { success: true }
}

export async function deletePreference(id: string) {
  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from("preferences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidateAll()
  return { success: true }
}

export async function upsertAnswer(input: {
  questionKey: string
  answerValue: string
  answerState: AnswerState
  mode: MatchMode | ""
}) {
  const { supabase, user } = await requireUser()

  if (!ANSWER_STATES.includes(input.answerState)) {
    return { error: "Invalid answer state." }
  }

  const mode =
    input.mode && MATCH_MODES.includes(input.mode as MatchMode)
      ? (input.mode as MatchMode)
      : null

  const value =
    input.answerState === "answered" ? input.answerValue.trim() || null : null

  if (input.answerState === "answered" && !value) {
    return { error: "Please provide an answer value, or choose another state." }
  }

  let existingQuery = supabase
    .from("answers")
    .select("id")
    .eq("user_id", user.id)
    .eq("question_key", input.questionKey)

  existingQuery = mode
    ? existingQuery.eq("mode", mode)
    : existingQuery.is("mode", null)

  const { data: existing } = await existingQuery.maybeSingle()

  const payload = {
    user_id: user.id,
    question_key: input.questionKey,
    answer_value: value,
    answer_state: input.answerState,
    mode,
  }

  const { error } = existing
    ? await supabase.from("answers").update(payload).eq("id", existing.id)
    : await supabase.from("answers").insert(payload)

  if (error) return { error: error.message }
  revalidateAll()
  return { success: true }
}

export async function setAvailabilityBlocks(blocks: AvailabilityBlock[]) {
  const { supabase, user } = await requireUser()

  const unique = Array.from(
    new Set(blocks.filter((b) => AVAILABILITY_BLOCKS.includes(b)))
  )

  const { error: deleteError } = await supabase
    .from("availability")
    .delete()
    .eq("user_id", user.id)

  if (deleteError) return { error: deleteError.message }

  if (unique.length > 0) {
    const { error } = await supabase.from("availability").insert(
      unique.map((block) => ({
        user_id: user.id,
        block,
      }))
    )
    if (error) return { error: error.message }
  }

  revalidateAll()
  return { success: true }
}

export async function createInterest(input: {
  name: string
  category: string
  involvement: InvolvementLevel
  wantsShared: boolean
}) {
  const { supabase, user } = await requireUser()
  const name = input.name.trim()
  if (!name) return { error: "Interest name is required." }
  if (!INVOLVEMENT_LEVELS.includes(input.involvement)) {
    return { error: "Invalid involvement level." }
  }

  const { error } = await supabase.from("interests").insert({
    user_id: user.id,
    name,
    category: input.category.trim() || null,
    involvement: input.involvement,
    wants_shared: input.wantsShared,
  })

  if (error) return { error: error.message }
  revalidateAll()
  return { success: true }
}

export async function deleteInterest(id: string) {
  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from("interests")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidateAll()
  return { success: true }
}

export async function createSkill(input: {
  name: string
  level: SkillLevel
  canTeach: boolean
  wantsToLearn: boolean
}) {
  const { supabase, user } = await requireUser()
  const name = input.name.trim()
  if (!name) return { error: "Skill name is required." }
  if (!SKILL_LEVELS.includes(input.level)) {
    return { error: "Invalid skill level." }
  }

  const { error } = await supabase.from("skills").insert({
    user_id: user.id,
    name,
    level: input.level,
    can_teach: input.canTeach,
    wants_to_learn: input.wantsToLearn,
  })

  if (error) return { error: error.message }
  revalidateAll()
  return { success: true }
}

export async function deleteSkill(id: string) {
  const { supabase, user } = await requireUser()
  const { error } = await supabase
    .from("skills")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  revalidateAll()
  return { success: true }
}

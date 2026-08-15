import type {
  AnswerState,
  AvailabilityBlock,
  ImportanceLevel,
  InvolvementLevel,
  MatchMode,
  SkillLevel,
} from "@/lib/constants/modes"

export type Profile = {
  id: string
  display_name: string | null
  username: string | null
  date_of_birth: string | null
  location_text: string | null
  bio: string | null
  avatar_url: string | null
  active_mode: MatchMode | null
  created_at: string
  updated_at: string
}

export type ContextProfile = {
  id: string
  user_id: string
  mode: MatchMode
  looking_for: string | null
  goal: string | null
  notes: string | null
  relationship_intent: string | null
  relationship_structure: string | null
  study_subject: string | null
  study_relationship_type: string | null
  role_preference: string | null
  custom_label: string | null
  created_at: string
  updated_at: string
}

export type Preference = {
  id: string
  user_id: string
  mode: MatchMode | null
  preference_key: string
  preference_value: string
  importance: ImportanceLevel
  is_hard_boundary: boolean
  created_at: string
  updated_at: string
}

export type Answer = {
  id: string
  user_id: string
  mode: MatchMode | null
  question_key: string
  answer_value: string | null
  answer_state: AnswerState
  created_at: string
  updated_at: string
}

export type Interest = {
  id: string
  user_id: string
  name: string
  category: string | null
  involvement: InvolvementLevel
  wants_shared: boolean
  created_at: string
  updated_at: string
}

export type Skill = {
  id: string
  user_id: string
  name: string
  level: SkillLevel
  can_teach: boolean
  wants_to_learn: boolean
  created_at: string
  updated_at: string
}

export type Availability = {
  id: string
  user_id: string
  block: AvailabilityBlock
  created_at: string
}

export type EvidenceLevel = "Limited" | "Emerging" | "Moderate" | "Strong"

export type ProfileBundle = {
  profile: Profile | null
  contextProfiles: ContextProfile[]
  preferences: Preference[]
  answers: Answer[]
  interests: Interest[]
  skills: Skill[]
  availability: Availability[]
}

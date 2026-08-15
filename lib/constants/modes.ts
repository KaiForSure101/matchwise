export const MATCH_MODES = [
  "dating",
  "friends",
  "study",
  "activities",
  "professional",
  "teams",
  "custom",
] as const

export type MatchMode = (typeof MATCH_MODES)[number]

export const MODE_META: Record<
  MatchMode,
  {
    label: string
    tagline: string
    description: string
    focus: string
  }
> = {
  dating: {
    label: "Dating",
    tagline: "Attraction + Future + Relationship",
    description: "Aligned values, pacing, and relationship intent.",
    focus: "Attraction, future outlook, and relationship structure.",
  },
  friends: {
    label: "Friends",
    tagline: "Interests + Energy + Availability",
    description: "Shared interests, availability, and social energy.",
    focus: "Shared activities, vibe, and time to hang out.",
  },
  study: {
    label: "Study",
    tagline: "Goal + Schedule + Commitment",
    description: "Subjects, focus style, and accountability habits.",
    focus: "Learning goals, subjects, and study rhythm.",
  },
  activities: {
    label: "Activities",
    tagline: "Hobby + Schedule + Group Fit",
    description: "Hobbies, schedule fit, and preferred group size.",
    focus: "What you want to do and when you can do it.",
  },
  professional: {
    label: "Professional",
    tagline: "Skills + Goals + Collaboration",
    description: "Skills, goals, and collaboration preferences.",
    focus: "Skills, working style, and collaboration aims.",
  },
  teams: {
    label: "Teams",
    tagline: "Skills + Roles + Coordination",
    description: "Role fit, working rhythm, and delivery context.",
    focus: "Roles, complementary skills, and coordination.",
  },
  custom: {
    label: "Custom Match",
    tagline: "Your Goal + Your Criteria",
    description: "Define your own goal and evidence criteria.",
    focus: "A purpose you define in your own words.",
  },
}

export const AVAILABILITY_BLOCKS = [
  "morning",
  "afternoon",
  "evening",
  "late_night",
] as const

export type AvailabilityBlock = (typeof AVAILABILITY_BLOCKS)[number]

export const AVAILABILITY_LABELS: Record<AvailabilityBlock, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  late_night: "Late night",
}

export const IMPORTANCE_LEVELS = ["low", "medium", "high"] as const
export type ImportanceLevel = (typeof IMPORTANCE_LEVELS)[number]

export const ANSWER_STATES = [
  "answered",
  "dont_know",
  "not_answered",
  "prefer_not",
  "not_applicable",
] as const
export type AnswerState = (typeof ANSWER_STATES)[number]

export const ANSWER_STATE_LABELS: Record<AnswerState, string> = {
  answered: "Answered",
  dont_know: "Don't know",
  not_answered: "Not answered",
  prefer_not: "Prefer not to answer",
  not_applicable: "Not applicable",
}

export const INVOLVEMENT_LEVELS = [
  "casual",
  "interested",
  "active",
  "very_active",
] as const
export type InvolvementLevel = (typeof INVOLVEMENT_LEVELS)[number]

export const INVOLVEMENT_LABELS: Record<InvolvementLevel, string> = {
  casual: "Casual",
  interested: "Interested",
  active: "Active",
  very_active: "Very active",
}

export const SKILL_LEVELS = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const
export type SkillLevel = (typeof SKILL_LEVELS)[number]

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
}

/** Minimal starter questions (keys are stable for future matching). */
export const STARTER_QUESTIONS: {
  key: string
  label: string
  modes?: MatchMode[]
}[] = [
  {
    key: "communication_style",
    label: "How do you usually like to communicate?",
  },
  {
    key: "pace_preference",
    label: "What pace feels right for new connections?",
  },
  {
    key: "group_size",
    label: "Do you prefer one-on-one or small groups?",
    modes: ["friends", "activities", "study", "teams"],
  },
]

"use server"

import { parseCustomCriteria } from "@/lib/custom-match/schema"
import { executeCustomMatch as runCustomMatch } from "@/lib/custom-match/adapter"

const SYSTEM_PROMPT = `You are Matchwise's criteria extraction assistant.
Your job is to convert a user's natural-language matching request into a structured Matchwise criteria object.
Only use the supported Matchwise fields below.
Do not invent beauty scores, personality scores, or unsupported profile dimensions.
Return valid JSON only, never freeform text.

You must return this exact top-level shape:
{
  "mode": "dating" | "friends" | "study" | "teams",
  "objective": "short description of the goal",
  "candidateType": "person" | "team",
  "criteria": [
    {
      "key": "skills" | "availability" | "interests" | "roles" | "goal" | "study_subject" | "relationship_intent" | "location",
      "operator": "equals" | "includes" | "contains" | "available_on" | "has_skill" | "has_interest" | "matches",
      "value": "string or array of strings",
      "importance": "required" | "high" | "medium" | "low",
      "hard": true | false
    }
  ],
  "requestedSkills": ["string"],
  "availabilityRequirements": ["string"],
  "teamSize": 4,
  "explanation": "short explanation"
}

Rules:
- Do not add top-level keys like "skills" or "availability".
- Put all matching requirements inside the "criteria" array.
- Supported fields are limited to skills, availability, interests, roles, goal, study_subject, relationship_intent, and location.
- If the request cannot be represented with supported Matchwise fields, return a safe structured error object with an "error" field and a brief reason.
- Use "team" only as a mode value if the request is for a team; otherwise use "teams".
- Keep the output concise and deterministic.
`

export async function interpretCustomMatchRequest(request: string) {
  const text = request.trim()
  if (!text) {
    return { error: "Please describe what you're looking for before interpreting the request." }
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { error: "DeepSeek is not configured on this server." }
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
    }),
  })

  if (!response.ok) {
    return { error: "DeepSeek could not interpret the request right now. Please try again." }
  }

  const json = await response.json().catch(() => null)
  const content = json?.choices?.[0]?.message?.content
  if (!content) {
    return { error: "DeepSeek returned an empty response. Please try another request." }
  }

  let payload: unknown
  try {
    payload = JSON.parse(content)
  } catch {
    return { error: "DeepSeek returned malformed JSON. Please try a simpler request." }
  }

  const validated = parseCustomCriteria(payload)
  if (!validated.success) {
    return { error: `The request could not be validated for Matchwise: ${validated.error}` }
  }

  return { success: true, criteria: validated.data }
}

export async function executeCustomMatch(rawCriteria: unknown) {
  const parsed = parseCustomCriteria(rawCriteria)
  if (!parsed.success) {
    return { error: parsed.error }
  }

  const results = await runCustomMatch(parsed.data)
  return { success: true, results }
}

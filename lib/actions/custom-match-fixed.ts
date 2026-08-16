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

  // Demo/mock fallback: allow local demos when FORCE_DEEPSEEK_MOCK=true
  const forceMock = process.env.FORCE_DEEPSEEK_MOCK === "true"
  if (forceMock) {
    // Simple deterministic mapping for common demo prompts
    const lower = text.toLowerCase()
    let mock: any = {
      mode: "friends",
      objective: text.slice(0, 200),
      candidateType: "person",
      criteria: [],
      requestedSkills: [],
      availabilityRequirements: [],
      explanation: "Mocked by local FORCE_DEEPSEEK_MOCK for demo",
    }

    if (lower.includes("hackathon") || lower.includes("team")) {
      mock.mode = "teams"
      mock.candidateType = "team"
      mock.teamSize = 4
      mock.requestedSkills = ["programming", "presentation"]
      mock.criteria.push({ key: "skills", operator: "includes", value: ["programming"], importance: "required", hard: true })
      mock.criteria.push({ key: "roles", operator: "includes", value: ["presenter"], importance: "high", hard: false })
      if (lower.includes("weekend")) {
        mock.availabilityRequirements = ["weekends"]
        mock.criteria.push({ key: "availability", operator: "available_on", value: ["weekends"], importance: "high", hard: true })
      }
    } else if (lower.includes("study") || lower.includes("learn")) {
      mock.mode = "study"
      mock.criteria.push({ key: "study_subject", operator: "equals", value: "python", importance: "required", hard: true })
      mock.requestedSkills = ["python"]
      mock.availabilityRequirements = ["weekends"]
    } else if (lower.includes("dating") || lower.includes("serious") || lower.includes("relationship")) {
      mock.mode = "dating"
      mock.candidateType = "person"
      mock.criteria.push({ key: "relationship_intent", operator: "equals", value: "serious", importance: "high", hard: false })
    } else if (lower.includes("friend") || lower.includes("friends")) {
      mock.mode = "friends"
      mock.criteria.push({ key: "interests", operator: "has_interest", value: ["gaming"], importance: "medium", hard: false })
    }

    const validatedMock = parseCustomCriteria(mock)
    if (!validatedMock.success) {
      return { error: `Local mock could not be validated: ${validatedMock.error}` }
    }
    return { success: true, criteria: validatedMock.data }
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return { error: "DeepSeek is not configured on this server." }
  }

  // Construct headers safely with the server-side key
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers,
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
    // Try to capture a concise error message from DeepSeek without leaking the key
    let detail = undefined
    try {
      const errJson = await response.json().catch(() => null)
      if (errJson && typeof errJson === "object") {
        detail = (errJson as any).error || (errJson as any).message || JSON.stringify(errJson)
      }
    } catch {}

    // Return a helpful but safe message
    if (response.status === 401) {
      return { error: "DeepSeek authentication failed (401). Check your DEEPSEEK_API_KEY and try again." }
    }
    if (response.status === 402) {
      return { error: "DeepSeek returned Payment Required (402). Enable billing or use FORCE_DEEPSEEK_MOCK=true for local demos." }
    }

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

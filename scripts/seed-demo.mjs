import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const password = process.env.DEMO_SEED_PASSWORD
if (!url || !key || !password) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and DEMO_SEED_PASSWORD in .env.local.")

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
const people = [
  { email: "demo.ari@example.test", name: "Ari", location: "Yangon", intent: "long-term", structure: "monogamous", subject: "Python", role: "designer", interests: ["Hiking", "Design"], skills: [{ name: "Python", level: "beginner", can_teach: false, wants_to_learn: true }] },
  { email: "demo.bea@example.test", name: "Bea", location: "Yangon", intent: "long-term", structure: "monogamous", subject: "Python", role: "backend", interests: ["Hiking", "Python"], skills: [{ name: "Python", level: "advanced", can_teach: true, wants_to_learn: false }] },
  { email: "demo.cai@example.test", name: "Cai", location: "Mandalay", intent: "exploring", structure: "monogamous", subject: "Biology", role: "researcher", interests: ["Photography", "Biology"], skills: [{ name: "Research", level: "advanced", can_teach: true, wants_to_learn: false }] },
  { email: "demo.dee@example.test", name: "Dee", location: "Yangon", intent: "long-term", structure: "monogamous", subject: "Python", role: "product", interests: ["Design", "Hiking"], skills: [{ name: "UI Design", level: "advanced", can_teach: true, wants_to_learn: false }] },
]

for (const person of people) {
  let { data, error } = await admin.auth.admin.createUser({ email: person.email, password, email_confirm: true, user_metadata: { display_name: person.name } })
  if (error && !error.message.toLowerCase().includes("already")) throw error
  if (!data?.user) {
    const { data: users } = await admin.auth.admin.listUsers({ perPage: 1000 })
    data = { user: users.users.find((user) => user.email === person.email) }
  }
  const id = data?.user?.id
  if (!id) throw new Error(`Could not resolve ${person.email}`)
  await admin.from("profiles").upsert({ id, display_name: person.name, location_text: person.location })
  for (const mode of ["dating", "friends", "study", "teams"]) await admin.from("context_profiles").upsert({ user_id: id, mode, looking_for: person.intent, goal: mode === "study" ? "learn" : mode === "teams" ? "collaborate" : "connect", relationship_intent: person.intent, relationship_structure: person.structure, study_subject: person.subject, study_relationship_type: "accountability", role_preference: person.role }, { onConflict: "user_id,mode" })
  await admin.from("interests").delete().eq("user_id", id)
  await admin.from("interests").insert(person.interests.map((name) => ({ user_id: id, name, involvement: "active", wants_shared: true })))
  await admin.from("skills").delete().eq("user_id", id)
  await admin.from("skills").insert(person.skills.map((skill) => ({ user_id: id, ...skill })))
  await admin.from("availability").upsert({ user_id: id, block: "evening" }, { onConflict: "user_id,block" })
}
console.log("Seeded fictional demo accounts. Sign in with any demo.*@example.test account and DEMO_SEED_PASSWORD.")

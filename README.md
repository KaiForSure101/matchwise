# Matchwise

Evidence-informed, context-aware human matching. Matching logic is deterministic and goal-specific; DeepSeek is reserved for interpretation and explanations (not scores).

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase values.
2. Run the full `schema.sql` in the Supabase SQL editor (Phase 1 + Phase 2).
3. Install and start:

```bash
npm install
npm run dev
```

Never put `SUPABASE_SERVICE_ROLE_KEY` or `DEEPSEEK_API_KEY` in client code or `NEXT_PUBLIC_*` variables.

Demo notes:

- If you do not have a DeepSeek account or your key returns 401/402, enable the local demo mock by setting in `.env.local`:

  FORCE_DEEPSEEK_MOCK=true

  Optionally allow the client UI to toggle the mock (for demos) by adding:

  ALLOW_CLIENT_FORCE_MOCK=true

  Then restart the Next.js dev server. The Custom Match page includes a "Use mock AI (local demo)" checkbox that lets you run the full flow without a DeepSeek key.

- Admin/debug: enable an internal debug view for development by setting server-side env:

  ADMIN_DEBUG=true

  Optionally show an "Admin Debug" link in the dashboard navigation by also setting (client-side):

  NEXT_PUBLIC_ADMIN_DEBUG=true

  When enabled (server + client flag), visit /profile/debug to inspect the server-side profile bundle and top discovery results for the signed-in user. Do not enable these in production or with real user data.


## Phase status

- **Phase 1:** Auth, landing, protected dashboard shell
- **Phase 2:** Profiles, mode context, preferences, answers, availability, interests, skills
- **Phase 3:** Pure TypeScript matching primitives, private block data, eligibility, hard boundaries, confidence, weighted scoring, explanations, and versioned results. No mode engine or discovery UI.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
- `npm run test` — matching-engine unit tests
- `npm run seed:demo` — create fictional demo accounts after setting `DEMO_SEED_PASSWORD` locally

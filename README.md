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

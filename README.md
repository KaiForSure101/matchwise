# Matchwise

Evidence-informed, context-aware human matching. Matching logic is deterministic and goal-specific; DeepSeek is reserved for interpretation and explanations (not scores).

## Phase 1 stack

- Next.js App Router + TypeScript (strict)
- Tailwind CSS + shadcn/ui
- Supabase Auth + PostgreSQL (RLS)
- DeepSeek API key reserved for later phases (server-only)

## Setup

1. Copy `.env.example` to `.env.local` and fill in Supabase values.
2. Run `schema.sql` in the Supabase SQL editor.
3. Install and start:

```bash
npm install
npm run dev
```

Never put `SUPABASE_SERVICE_ROLE_KEY` or `DEEPSEEK_API_KEY` in client code or `NEXT_PUBLIC_*` variables.

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint

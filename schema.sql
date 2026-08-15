-- Matchwise schema (Phase 1 + Phase 2)
-- Run in the Supabase SQL editor.
-- Idempotent where practical: safe to re-run on a fresh or Phase-1 project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared enums / checks
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.match_mode as enum (
    'dating',
    'friends',
    'study',
    'activities',
    'professional',
    'teams',
    'custom'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.preference_importance as enum ('low', 'medium', 'high');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.answer_state as enum (
    'answered',
    'dont_know',
    'not_answered',
    'prefer_not',
    'not_applicable'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.involvement_level as enum (
    'casual',
    'interested',
    'active',
    'very_active'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.skill_level as enum (
    'beginner',
    'intermediate',
    'advanced',
    'expert'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.availability_block as enum (
    'morning',
    'afternoon',
    'evening',
    'late_night'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles (account)
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists username text,
  add column if not exists date_of_birth date,
  add column if not exists location_text text,
  add column if not exists active_mode public.match_mode;

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

comment on table public.profiles is
  'Account profile for a Matchwise user. No global mate-value or beauty scores.';

alter table public.profiles enable row level security;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

drop policy if exists "Profiles are viewable by owner" on public.profiles;
create policy "Profiles are viewable by owner"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Profiles are deletable by owner" on public.profiles;
create policy "Profiles are deletable by owner"
on public.profiles
for delete
to authenticated
using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Context profiles (per mode)
-- ---------------------------------------------------------------------------

create table if not exists public.context_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode public.match_mode not null,
  looking_for text,
  goal text,
  notes text,
  -- Mode-leaning optional fields (nullable; used when relevant)
  relationship_intent text,
  relationship_structure text,
  study_subject text,
  study_relationship_type text,
  role_preference text,
  custom_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mode)
);

comment on table public.context_profiles is
  'Per-mode context for what the user is trying to create. Not a global human score.';

alter table public.context_profiles enable row level security;

drop trigger if exists context_profiles_set_updated_at on public.context_profiles;
create trigger context_profiles_set_updated_at
before update on public.context_profiles
for each row
execute function public.handle_updated_at();

drop policy if exists "Context profiles select own" on public.context_profiles;
create policy "Context profiles select own"
on public.context_profiles for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Context profiles insert own" on public.context_profiles;
create policy "Context profiles insert own"
on public.context_profiles for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Context profiles update own" on public.context_profiles;
create policy "Context profiles update own"
on public.context_profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Context profiles delete own" on public.context_profiles;
create policy "Context profiles delete own"
on public.context_profiles for delete to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Preferences (+ hard boundaries)
-- ---------------------------------------------------------------------------

create table if not exists public.preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode public.match_mode,
  preference_key text not null,
  preference_value text not null,
  importance public.preference_importance not null default 'medium',
  is_hard_boundary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists preferences_user_id_idx on public.preferences (user_id);
create index if not exists preferences_user_mode_idx on public.preferences (user_id, mode);

comment on table public.preferences is
  'What the user wants, with importance and optional hard-boundary flag.';

alter table public.preferences enable row level security;

drop trigger if exists preferences_set_updated_at on public.preferences;
create trigger preferences_set_updated_at
before update on public.preferences
for each row
execute function public.handle_updated_at();

drop policy if exists "Preferences select own" on public.preferences;
create policy "Preferences select own"
on public.preferences for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Preferences insert own" on public.preferences;
create policy "Preferences insert own"
on public.preferences for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Preferences update own" on public.preferences;
create policy "Preferences update own"
on public.preferences for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Preferences delete own" on public.preferences;
create policy "Preferences delete own"
on public.preferences for delete to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Answers (questionnaire; state-aware)
-- ---------------------------------------------------------------------------

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode public.match_mode,
  question_key text not null,
  answer_value text,
  answer_state public.answer_state not null default 'not_answered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- COALESCE so null mode still enforces one row per question per user.
create unique index if not exists answers_user_question_mode_uidx
  on public.answers (user_id, question_key, (coalesce(mode::text, '_')));

create index if not exists answers_user_id_idx on public.answers (user_id);

comment on table public.answers is
  'Questionnaire answers with explicit state so missing data is not treated as a negative.';

alter table public.answers enable row level security;

drop trigger if exists answers_set_updated_at on public.answers;
create trigger answers_set_updated_at
before update on public.answers
for each row
execute function public.handle_updated_at();

drop policy if exists "Answers select own" on public.answers;
create policy "Answers select own"
on public.answers for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Answers insert own" on public.answers;
create policy "Answers insert own"
on public.answers for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Answers update own" on public.answers;
create policy "Answers update own"
on public.answers for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Answers delete own" on public.answers;
create policy "Answers delete own"
on public.answers for delete to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Interests
-- ---------------------------------------------------------------------------

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text,
  involvement public.involvement_level not null default 'interested',
  wants_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interests_user_id_idx on public.interests (user_id);

alter table public.interests enable row level security;

drop trigger if exists interests_set_updated_at on public.interests;
create trigger interests_set_updated_at
before update on public.interests
for each row
execute function public.handle_updated_at();

drop policy if exists "Interests select own" on public.interests;
create policy "Interests select own"
on public.interests for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Interests insert own" on public.interests;
create policy "Interests insert own"
on public.interests for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Interests update own" on public.interests;
create policy "Interests update own"
on public.interests for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Interests delete own" on public.interests;
create policy "Interests delete own"
on public.interests for delete to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Skills
-- ---------------------------------------------------------------------------

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  level public.skill_level not null default 'beginner',
  can_teach boolean not null default false,
  wants_to_learn boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_user_id_idx on public.skills (user_id);

alter table public.skills enable row level security;

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
before update on public.skills
for each row
execute function public.handle_updated_at();

drop policy if exists "Skills select own" on public.skills;
create policy "Skills select own"
on public.skills for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Skills insert own" on public.skills;
create policy "Skills insert own"
on public.skills for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Skills update own" on public.skills;
create policy "Skills update own"
on public.skills for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Skills delete own" on public.skills;
create policy "Skills delete own"
on public.skills for delete to authenticated
using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Availability (simple blocks)
-- ---------------------------------------------------------------------------

create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  block public.availability_block not null,
  created_at timestamptz not null default now(),
  unique (user_id, block)
);

create index if not exists availability_user_id_idx on public.availability (user_id);

alter table public.availability enable row level security;

drop policy if exists "Availability select own" on public.availability;
create policy "Availability select own"
on public.availability for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Availability insert own" on public.availability;
create policy "Availability insert own"
on public.availability for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Availability update own" on public.availability;
create policy "Availability update own"
on public.availability for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Availability delete own" on public.availability;
create policy "Availability delete own"
on public.availability for delete to authenticated
using (auth.uid() = user_id);

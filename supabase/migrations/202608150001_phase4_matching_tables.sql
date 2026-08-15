-- Phase 4 matching tables and protections
-- This migration is intended to close the gap where the project schema existed in code
-- but the corresponding Supabase tables had never been applied to the live database.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- User blocks (shared eligibility safety data)
-- ---------------------------------------------------------------------------

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_no_self_block check (blocker_id <> blocked_id),
  unique (blocker_id, blocked_id)
);

comment on table public.user_blocks is
  'Private safety data used by common matching eligibility. Blocked users cannot read these rows.';

create index if not exists user_blocks_blocker_id_idx
  on public.user_blocks (blocker_id);

create index if not exists user_blocks_blocked_id_idx
  on public.user_blocks (blocked_id);

alter table public.user_blocks enable row level security;

drop policy if exists "Users can view their own blocks" on public.user_blocks;
create policy "Users can view their own blocks"
  on public.user_blocks for select to authenticated
  using (auth.uid() = blocker_id);

drop policy if exists "Users can create their own blocks" on public.user_blocks;
create policy "Users can create their own blocks"
  on public.user_blocks for insert to authenticated
  with check (auth.uid() = blocker_id);

drop policy if exists "Users can delete their own blocks" on public.user_blocks;
create policy "Users can delete their own blocks"
  on public.user_blocks for delete to authenticated
  using (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- Dating swipes and mutual matches (Phase 4)
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.swipe_action as enum ('like', 'pass');
exception when duplicate_object then null;
end $$;

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_user_id uuid not null references auth.users (id) on delete cascade,
  target_user_id uuid not null references auth.users (id) on delete cascade,
  mode public.match_mode not null,
  action public.swipe_action not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint swipes_no_self check (swiper_user_id <> target_user_id),
  unique (swiper_user_id, target_user_id, mode)
);

create index if not exists swipes_target_mode_action_idx
  on public.swipes (target_user_id, mode, action);

alter table public.swipes enable row level security;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists swipes_set_updated_at on public.swipes;
create trigger swipes_set_updated_at
before update on public.swipes
for each row
execute function public.handle_updated_at();

drop policy if exists "Swipers can view their own swipes" on public.swipes;
create policy "Swipers can view their own swipes"
  on public.swipes for select to authenticated
  using (auth.uid() = swiper_user_id);

drop policy if exists "Swipers can create their own swipes" on public.swipes;
create policy "Swipers can create their own swipes"
  on public.swipes for insert to authenticated
  with check (auth.uid() = swiper_user_id);

drop policy if exists "Swipers can update their own swipes" on public.swipes;
create policy "Swipers can update their own swipes"
  on public.swipes for update to authenticated
  using (auth.uid() = swiper_user_id)
  with check (auth.uid() = swiper_user_id);

drop policy if exists "Swipers can delete their own swipes" on public.swipes;
create policy "Swipers can delete their own swipes"
  on public.swipes for delete to authenticated
  using (auth.uid() = swiper_user_id);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references auth.users (id) on delete cascade,
  user_b_id uuid not null references auth.users (id) on delete cascade,
  mode public.match_mode not null,
  created_at timestamptz not null default now(),
  constraint matches_ordered_pair check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id, mode)
);

alter table public.matches enable row level security;

drop policy if exists "Participants can view their matches" on public.matches;
create policy "Participants can view their matches"
  on public.matches for select to authenticated
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

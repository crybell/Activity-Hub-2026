create extension if not exists citext;

create table if not exists public.trivia_leaderboard (
  id bigint generated always as identity primary key,
  player_name text not null,
  player_name_normalized citext generated always as (trim(player_name)) stored,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint trivia_leaderboard_unique_name unique (player_name_normalized)
);

alter table public.trivia_leaderboard enable row level security;

grant select, insert on public.trivia_leaderboard to anon;

drop policy if exists "Leaderboard is readable by everyone" on public.trivia_leaderboard;
create policy "Leaderboard is readable by everyone"
on public.trivia_leaderboard
for select
to anon
using (true);

drop policy if exists "Leaderboard accepts public scores" on public.trivia_leaderboard;
create policy "Leaderboard accepts public scores"
on public.trivia_leaderboard
for insert
to anon
with check (
  char_length(trim(player_name)) between 1 and 30
  and score >= 0
  and total > 0
);

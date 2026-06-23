create table if not exists public.game_leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  game_key text not null,
  player_token_hash text not null,
  name text not null,
  high_score integer not null default 0 check (high_score >= 0),
  country text not null default 'Unknown',
  high_score_achieved_at timestamptz not null default now(),
  last_played_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint game_leaderboard_entries_game_player_unique unique (
    game_key,
    player_token_hash
  ),
  constraint game_leaderboard_entries_game_name_unique unique (game_key, name)
);

create index if not exists game_leaderboard_entries_score_idx
  on public.game_leaderboard_entries (
    game_key,
    high_score desc,
    high_score_achieved_at asc
  );

alter table public.game_leaderboard_entries enable row level security;

drop policy if exists "Game leaderboard entries are public readable"
  on public.game_leaderboard_entries;

create policy "Game leaderboard entries are public readable"
  on public.game_leaderboard_entries
  for select
  using (true);

grant select on public.game_leaderboard_entries to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_game_leaderboard_entries_updated_at
  on public.game_leaderboard_entries;

create trigger set_game_leaderboard_entries_updated_at
  before update on public.game_leaderboard_entries
  for each row
  execute function public.set_updated_at();

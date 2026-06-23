revoke select on public.game_leaderboard_entries from anon, authenticated;

drop policy if exists "Game leaderboard entries are public readable"
  on public.game_leaderboard_entries;

drop view if exists public.game_leaderboard_rows;

alter table public.game_leaderboard_entries
  add column if not exists country_code text,
  add column if not exists country_name text;

update public.game_leaderboard_entries
set country_name = case
  when country is null
    or btrim(country) = ''
    or lower(btrim(country)) = 'unknown'
    then null
  else country
end
where country_name is null;

alter table public.game_leaderboard_entries
  drop constraint if exists game_leaderboard_entries_country_code_format,
  add constraint game_leaderboard_entries_country_code_format
    check (country_code is null or country_code ~ '^[A-Z]{2}$');

alter table public.game_leaderboard_entries
  drop column if exists country;

create view public.game_leaderboard_rows
with (security_barrier = true)
as
select
  id,
  game_key,
  name,
  high_score,
  country_code,
  country_name,
  high_score_achieved_at
from public.game_leaderboard_entries;

grant select on public.game_leaderboard_rows to anon, authenticated;

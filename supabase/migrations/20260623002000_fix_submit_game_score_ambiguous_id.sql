create or replace function public.submit_game_score(
  p_game_key text,
  p_player_token_hash text,
  p_name text,
  p_score integer,
  p_country_code text default null,
  p_country_name text default null
)
returns table (
  id uuid,
  name text,
  high_score integer,
  is_new_high_score boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_entry public.game_leaderboard_entries%rowtype;
  saved_entry public.game_leaderboard_entries%rowtype;
  submitted_at timestamptz := now();
begin
  if p_score is null or p_score < 0 then
    raise exception 'Score must be a non-negative integer';
  end if;

  select *
  into existing_entry
  from public.game_leaderboard_entries
  where game_key = p_game_key
    and player_token_hash = p_player_token_hash
  for update;

  if found then
    update public.game_leaderboard_entries as entries
    set
      country_code = coalesce(p_country_code, existing_entry.country_code),
      country_name = coalesce(p_country_name, existing_entry.country_name),
      high_score = greatest(existing_entry.high_score, p_score),
      high_score_achieved_at = case
        when p_score > existing_entry.high_score then submitted_at
        else existing_entry.high_score_achieved_at
      end,
      last_played_at = submitted_at
    where entries.id = existing_entry.id
    returning *
    into saved_entry;

    return query
    select
      saved_entry.id,
      saved_entry.name,
      saved_entry.high_score,
      p_score > existing_entry.high_score;

    return;
  end if;

  insert into public.game_leaderboard_entries (
    country_code,
    country_name,
    game_key,
    high_score,
    high_score_achieved_at,
    last_played_at,
    name,
    player_token_hash
  )
  values (
    p_country_code,
    p_country_name,
    p_game_key,
    p_score,
    submitted_at,
    submitted_at,
    p_name,
    p_player_token_hash
  )
  returning *
  into saved_entry;

  return query
  select
    saved_entry.id,
    saved_entry.name,
    saved_entry.high_score,
    true;
end;
$$;

revoke execute on function public.submit_game_score(
  text,
  text,
  text,
  integer,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.submit_game_score(
  text,
  text,
  text,
  integer,
  text,
  text
) to service_role;

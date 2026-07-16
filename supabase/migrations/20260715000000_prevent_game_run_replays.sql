alter table public.game_leaderboard_entries
  add column if not exists consumed_runs jsonb not null default '[]'::jsonb;

alter table public.game_leaderboard_entries
  drop constraint if exists game_leaderboard_entries_consumed_runs_array,
  add constraint game_leaderboard_entries_consumed_runs_array
    check (jsonb_typeof(consumed_runs) = 'array');

drop function if exists public.submit_game_score(
  text,
  text,
  text,
  integer,
  text,
  text
);

create function public.submit_game_score(
  p_game_key text,
  p_player_token_hash text,
  p_name text,
  p_score integer,
  p_run_nonce text,
  p_run_expires_at timestamptz,
  p_country_code text default null,
  p_country_name text default null
)
returns table (
  id uuid,
  name text,
  high_score integer,
  is_new_high_score boolean,
  is_run_replay boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  active_consumed_runs jsonb := '[]'::jsonb;
  consumed_run jsonb;
  existing_entry public.game_leaderboard_entries%rowtype;
  saved_entry public.game_leaderboard_entries%rowtype;
  submitted_at timestamptz := now();
begin
  if p_score is null or p_score < 0 then
    raise exception 'Score must be a non-negative integer';
  end if;

  if p_run_nonce is null or p_run_nonce = '' or length(p_run_nonce) > 128 then
    raise exception 'Run nonce is invalid';
  end if;

  if p_run_expires_at is null then
    raise exception 'Run expiration is required';
  end if;

  -- Serialize both first-time inserts and later updates for this player.
  perform pg_advisory_xact_lock(
    hashtextextended(p_game_key || ':' || p_player_token_hash, 0)
  );

  select *
  into existing_entry
  from public.game_leaderboard_entries
  where game_key = p_game_key
    and player_token_hash = p_player_token_hash
  for update;

  if found then
    -- Keep a short buffer for requests verified immediately before expiry.
    select coalesce(jsonb_agg(run), '[]'::jsonb)
    into active_consumed_runs
    from jsonb_array_elements(existing_entry.consumed_runs) as consumed(run)
    where (run ->> 'expiresAt')::timestamptz
      > submitted_at - interval '1 minute';

    select run
    into consumed_run
    from jsonb_array_elements(active_consumed_runs) as consumed(run)
    where run ->> 'nonce' = p_run_nonce
    limit 1;

    if found then
      return query
      select
        existing_entry.id,
        existing_entry.name,
        existing_entry.high_score,
        false,
        (consumed_run ->> 'score')::integer <> p_score;

      return;
    end if;

    active_consumed_runs := active_consumed_runs || jsonb_build_array(
      jsonb_build_object(
        'expiresAt', p_run_expires_at,
        'nonce', p_run_nonce,
        'score', p_score
      )
    );

    update public.game_leaderboard_entries as entries
    set
      consumed_runs = active_consumed_runs,
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
      p_score > existing_entry.high_score,
      false;

    return;
  end if;

  active_consumed_runs := jsonb_build_array(
    jsonb_build_object(
      'expiresAt', p_run_expires_at,
      'nonce', p_run_nonce,
      'score', p_score
    )
  );

  insert into public.game_leaderboard_entries (
    consumed_runs,
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
    active_consumed_runs,
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
    true,
    false;
end;
$$;

revoke execute on function public.submit_game_score(
  text,
  text,
  text,
  integer,
  text,
  timestamptz,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.submit_game_score(
  text,
  text,
  text,
  integer,
  text,
  timestamptz,
  text,
  text
) to service_role;

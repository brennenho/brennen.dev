-- Run against a disposable database after applying all migrations:
-- psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/game_run_replays.sql
begin;

do $$
declare
  result record;
  original_updated_at timestamptz;
  original_runs jsonb;
  stored_runs jsonb;
begin
  -- The old application must still save scores after the migration, including
  -- on rows subsequently used by the new application.
  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Replay Test', 100, 'US', 'United States'
  );
  assert result.high_score = 100, 'legacy insert failed';

  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 200,
    'run-1', now() + interval '30 minutes', 'US', 'United States'
  );
  assert result.high_score = 200 and result.is_new_high_score
    and not result.is_run_replay, 'new run did not save';

  select updated_at, consumed_runs into original_updated_at, original_runs
  from public.game_leaderboard_entries
  where game_key = 'dino' and player_token_hash = 'replay-test-player';

  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 200,
    'run-1', now() + interval '30 minutes'
  );
  assert result.high_score = 200 and not result.is_new_high_score
    and not result.is_run_replay, 'identical retry failed';

  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 500,
    'run-1', now() + interval '30 minutes'
  );
  assert result.high_score = 200 and result.is_run_replay,
    'higher-score replay was accepted';

  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 50,
    'run-1', now() + interval '30 minutes'
  );
  assert result.high_score = 200 and result.is_run_replay,
    'lower-score replay was accepted';
  assert exists (
    select 1 from public.game_leaderboard_entries
    where player_token_hash = 'replay-test-player'
      and consumed_runs = original_runs and updated_at = original_updated_at
  ), 'retries mutated the stored run';

  -- A failed transaction must not consume the nonce.
  begin
    perform public.submit_game_score(
      'dino', 'replay-test-player', 'Unused Name', 600,
      'rolled-back-run', now() + interval '30 minutes'
    );
    raise exception 'force rollback' using errcode = 'ZX001';
  exception when sqlstate 'ZX001' then
    null;
  end;
  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 300,
    'rolled-back-run', now() + interval '30 minutes'
  );
  assert result.high_score = 300 and not result.is_run_replay,
    'rollback consumed the nonce or retained the score';

  -- Old deployments / rollbacks preserve replay history on shared rows.
  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 350, null, null
  );
  assert result.high_score = 350, 'legacy update failed';
  select * into result from public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 700,
    'run-1', now() + interval '30 minutes'
  );
  assert result.high_score = 350 and result.is_run_replay,
    'legacy update erased replay protection';

  -- Keep the expiry grace buffer, but prune entries beyond it.
  update public.game_leaderboard_entries
  set consumed_runs = consumed_runs || jsonb_build_array(
    jsonb_build_object('nonce', 'expired', 'score', 1,
      'expiresAt', now() - interval '2 minutes'),
    jsonb_build_object('nonce', 'grace', 'score', 1,
      'expiresAt', now() - interval '30 seconds')
  )
  where player_token_hash = 'replay-test-player';
  perform public.submit_game_score(
    'dino', 'replay-test-player', 'Unused Name', 400,
    'run-2', now() + interval '30 minutes'
  );
  select consumed_runs into stored_runs from public.game_leaderboard_entries
  where player_token_hash = 'replay-test-player';
  assert not stored_runs @> '[{"nonce":"expired"}]'::jsonb,
    'expired nonce was retained';
  assert stored_runs @> '[{"nonce":"grace"}]'::jsonb,
    'expiry grace buffer was pruned too early';

  -- Exercise first insert directly through the new overload.
  select * into result from public.submit_game_score(
    'dino', 'replay-test-new-player', 'New Replay Test', 10,
    'first-run', now() + interval '30 minutes'
  );
  assert result.high_score = 10 and result.is_new_high_score
    and not result.is_run_replay, 'first new-client insert failed';

  assert not has_function_privilege('anon',
    'public.submit_game_score(text,text,text,integer,text,timestamptz,text,text)',
    'EXECUTE'), 'anonymous clients can bypass run verification';
  assert not has_function_privilege('authenticated',
    'public.submit_game_score(text,text,text,integer,text,timestamptz,text,text)',
    'EXECUTE'), 'authenticated clients can bypass run verification';
  assert has_function_privilege('service_role',
    'public.submit_game_score(text,text,text,integer,text,timestamptz,text,text)',
    'EXECUTE'), 'score API cannot execute the new function';
end;
$$;

rollback;

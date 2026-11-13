# Game score migrations

Apply `20260715000000_prevent_game_run_replays.sql` **before** deploying the
application from PR #26. It adds `consumed_runs` and an eight-argument overload of
`submit_game_score`. The six-argument overload remains available to the existing
deployment and to an application rollback. Both overloads are restricted to the
service role; the API verifies the signed token before calling the new overload.

Run the migration against the preview database first. Check first submission,
identical retries, rejection of changed-score retries, and saving a new run. Then
apply it to production before merging the application PR. Merging code alone does
not apply Supabase migrations.

If an earlier version of this migration was applied manually, confirm the legacy
overload still exists:

```sql
select to_regprocedure(
  'public.submit_game_score(text,text,text,integer,text,text)'
);
```

If it is missing, restore it using
`20260623002000_fix_submit_game_score_ambiguous_id.sql` before rollout. Do not
drop the new overload or `consumed_runs` during an application rollback.

The old application does not enforce one-use tokens. Replay protection is active
when requests reach the updated application; it is not proof of human gameplay.

For database regression checks, apply the full migration history to a disposable
PostgreSQL database with the Supabase `anon`, `authenticated`, and `service_role`
roles, then run:

```sh
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/game_run_replays.sql
```

The test transaction rolls back its data. It covers both RPC signatures, replay
rejection, identical retries, rollback, expiry pruning, and execution privileges.

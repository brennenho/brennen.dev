import { describe, expect, it, vi } from "vitest";

import { submitGameScore } from "@/lib/games/leaderboard";
import type { createAdminClient } from "@/lib/supabase/admin";

const ENTRY = {
  high_score: 1_024,
  id: "entry-id",
  is_new_high_score: true,
  is_run_replay: false,
  name: "Pixel Runner",
};

describe("submitGameScore", () => {
  it("passes verified run claims into the score transaction", async () => {
    const { rpc, supabase } = createSupabaseMock(ENTRY);

    await expect(submitScore(supabase)).resolves.toEqual({
      entry: ENTRY,
      ok: true,
    });
    expect(rpc).toHaveBeenCalledOnce();
  });

  it("reports a changed-score replay without retrying storage", async () => {
    const replayEntry = { ...ENTRY, is_run_replay: true };
    const { rpc, supabase } = createSupabaseMock(replayEntry);

    await expect(submitScore(supabase)).resolves.toEqual({
      error: "run-reused",
      ok: false,
    });
    expect(rpc).toHaveBeenCalledOnce();
  });
});

function submitScore(supabase: ReturnType<typeof createAdminClient>) {
  return submitGameScore({
    country: { code: "US", name: "United States" },
    gameKey: "dino",
    playerTokenHash: "player-token-hash",
    run: {
      expiresAt: 2_000_000_000_000,
      nonce: "run-nonce",
    },
    score: 1_024,
    supabase,
  });
}

function createSupabaseMock(data: typeof ENTRY) {
  const single = vi.fn().mockResolvedValue({ data, error: null });
  const rpc = vi.fn(
    (functionName: string, parameters: Record<string, unknown>) => {
      expect(functionName).toBe("submit_game_score");
      expect(parameters).toEqual({
        p_country_code: "US",
        p_country_name: "United States",
        p_game_key: "dino",
        p_name: parameters.p_name,
        p_player_token_hash: "player-token-hash",
        p_run_expires_at: "2033-05-18T03:33:20.000Z",
        p_run_nonce: "run-nonce",
        p_score: 1_024,
      });
      expect(typeof parameters.p_name).toBe("string");

      return { single };
    },
  );
  const supabase = { rpc } as unknown as ReturnType<typeof createAdminClient>;

  return { rpc, supabase };
}

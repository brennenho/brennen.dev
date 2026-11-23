import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookie: vi.fn(),
  rpc: vi.fn(),
  single: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mocks.cookie }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ rpc: mocks.rpc }),
}));

import { POST } from "./route";
import { hashPlayerToken } from "@/lib/games/player-token";
import { createGameRunToken } from "@/lib/games/run-token";

const PLAYER_TOKEN = "a".repeat(64);
const SECRET = "score-route-test-secret";
const NOW = 2_000_000_000_000;
const ENTRY = {
  id: "entry-id",
  name: "Pixel Runner",
  high_score: 500,
  is_new_high_score: true,
  is_run_replay: false,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  vi.stubEnv("GAME_RUN_TOKEN_SECRET", SECRET);
  mocks.cookie.mockReturnValue({ value: PLAYER_TOKEN });
  mocks.rpc.mockReturnValue({ single: mocks.single });
  mocks.single.mockResolvedValue({ data: ENTRY, error: null });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

describe("POST /api/games/dino/score", () => {
  it("passes the signed run identity through to storage", async () => {
    const response = await submit();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      name: ENTRY.name,
      highScore: 500,
      submittedScore: 500,
      isNewHighScore: true,
    });
    expect(mocks.rpc).toHaveBeenCalledWith(
      "submit_game_score",
      expect.objectContaining({
        p_player_token_hash: hashPlayerToken(PLAYER_TOKEN),
        p_run_nonce: expect.stringMatching(/^[A-Za-z0-9_-]{22}$/) as unknown,
        p_run_expires_at: new Date(NOW + 29 * 60_000).toISOString(),
        p_score: 500,
      }),
    );
  });

  it("accepts an identical retry without claiming a new high score", async () => {
    mocks.single.mockResolvedValue({
      data: { ...ENTRY, is_new_high_score: false },
      error: null,
    });
    const response = await submit();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      highScore: 500,
      isNewHighScore: false,
    });
  });

  it("returns a non-retryable conflict for a changed-score replay", async () => {
    mocks.single.mockResolvedValue({
      data: { ...ENTRY, is_run_replay: true },
      error: null,
    });
    const response = await submit();
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "This game run has already submitted a different score.",
    });
    expect(mocks.rpc).toHaveBeenCalledOnce();
  });

  it("leaves storage failures retryable", async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: "XX000" } });
    expect((await submit()).status).toBe(500);
  });

  it("rejects an invalid token before consuming a run", async () => {
    expect((await submit("invalid-token")).status).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
});

function submit(
  runToken = createGameRunToken({
    gameKey: "dino",
    playerTokenHash: hashPlayerToken(PLAYER_TOKEN),
    secret: SECRET,
    startedAt: NOW - 60_000,
  }),
) {
  return POST(
    new Request("http://localhost/api/games/dino/score", {
      method: "POST",
      body: JSON.stringify({ score: 500, runToken }),
      headers: { "Content-Type": "application/json" },
    }),
    { params: Promise.resolve({ gameKey: "dino" }) },
  );
}

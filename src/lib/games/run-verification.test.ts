import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGameConfig } from "@/lib/games/config";
import { createGameRunToken } from "@/lib/games/run-token";
import { verifyGameScoreRun } from "@/lib/games/run-verification";

import { simulateDinoScore } from "./dino-scoring.test-helper";

const NOW = 2_000_000_000_000;
const PLAYER_TOKEN_HASH = "player-token-hash";
const SECRET = "test-run-token-secret";

describe("verifyGameScoreRun", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.stubEnv("GAME_RUN_TOKEN_SECRET", SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it.each([81, 120, 300])(
    "accepts a legitimate %d-second high-scoring run",
    (elapsedSeconds) => {
      expect(
        verifyAt(elapsedSeconds, simulateDinoScore(elapsedSeconds)),
      ).toMatchObject({ ok: true });
    },
  );

  it("accepts the maximum leaderboard score once it is reachable", () => {
    expect(verifyAt(1_058, getGameConfig("dino").maxScore)).toMatchObject({
      ok: true,
    });
  });

  it("rejects a score above the reachable envelope", () => {
    expect(verifyAt(10, 200)).toEqual({
      error: "impossible-score",
      ok: false,
    });
  });

  it("keeps token identity and expiration checks intact", () => {
    const validToken = createToken(60);

    expect(
      verifyGameScoreRun({
        gameKey: "dino",
        playerTokenHash: "another-player",
        submission: { runToken: validToken, score: 1 },
      }),
    ).toEqual({ error: "invalid-run", ok: false });
    expect(verifyAt(30 * 60 + 1, 1)).toEqual({
      error: "invalid-run",
      ok: false,
    });
  });

  it("returns the nonce and expiration needed to consume the run", () => {
    const runToken = createToken(60);
    const result = verifyGameScoreRun({
      gameKey: "dino",
      playerTokenHash: PLAYER_TOKEN_HASH,
      submission: { runToken, score: 1 },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("Expected the run to be valid.");

    expect(result.run.expiresAt).toBe(NOW - 60_000 + 30 * 60 * 1000);
    expect(result.run.nonce).toMatch(/^[A-Za-z0-9_-]{22}$/);
  });
});

function verifyAt(elapsedSeconds: number, score: number) {
  return verifyGameScoreRun({
    gameKey: "dino",
    playerTokenHash: PLAYER_TOKEN_HASH,
    submission: {
      runToken: createToken(elapsedSeconds),
      score,
    },
  });
}

function createToken(elapsedSeconds: number) {
  return createGameRunToken({
    gameKey: "dino",
    playerTokenHash: PLAYER_TOKEN_HASH,
    secret: SECRET,
    startedAt: NOW - elapsedSeconds * 1000,
  });
}

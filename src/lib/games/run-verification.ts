import { getGameConfig, type GameKey } from "@/lib/games/config";
import {
  getGameRunTokenSecret,
  verifyGameRunToken,
} from "@/lib/games/run-token";

type GameScoreSubmission = {
  runToken: string;
  score: number;
};

type VerifyGameScoreRunOptions = {
  gameKey: GameKey;
  playerTokenHash: string;
  submission: GameScoreSubmission;
};

type VerifyGameScoreRunResult =
  | {
      ok: true;
      run: {
        expiresAt: number;
        nonce: string;
      };
    }
  | {
      error: "misconfigured" | "invalid-run" | "impossible-score";
      ok: false;
    };

export type { GameScoreSubmission, VerifyGameScoreRunResult };

export function verifyGameScoreRun({
  gameKey,
  playerTokenHash,
  submission,
}: VerifyGameScoreRunOptions): VerifyGameScoreRunResult {
  const gameConfig = getGameConfig(gameKey);
  let runTokenSecret: string;

  try {
    runTokenSecret = getGameRunTokenSecret();
  } catch {
    return {
      error: "misconfigured",
      ok: false,
    };
  }

  const run = verifyGameRunToken(submission.runToken, {
    expectedGameKey: gameKey,
    expectedPlayerTokenHash: playerTokenHash,
    maxAgeMs: gameConfig.runTokenMaxAgeSeconds * 1000,
    secret: runTokenSecret,
  });

  if (!run) {
    return {
      error: "invalid-run",
      ok: false,
    };
  }

  if (
    submission.score >
    gameConfig.getMaxScoreForElapsed(
      run.elapsedMs + gameConfig.scoreGraceSeconds * 1000,
    )
  ) {
    return {
      error: "impossible-score",
      ok: false,
    };
  }

  return {
    ok: true,
    run: {
      expiresAt:
        run.payload.startedAt + gameConfig.runTokenMaxAgeSeconds * 1000,
      nonce: run.payload.nonce,
    },
  };
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { gameApiError } from "@/lib/games/api-response";
import { getGameConfig, getGameKey } from "@/lib/games/config";
import { submitGameScore } from "@/lib/games/leaderboard";
import { getCountry } from "@/lib/games/location";
import {
  GAME_PLAYER_COOKIE,
  hashPlayerToken,
  isValidPlayerToken,
} from "@/lib/games/player-token";
import {
  verifyGameScoreRun,
  type GameScoreSubmission,
} from "@/lib/games/run-verification";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    gameKey: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const gameKey = getGameKey((await params).gameKey);

  if (!gameKey) {
    return gameApiError("Unknown game.", 404);
  }

  const gameConfig = getGameConfig(gameKey);
  const scoreSubmission = await parseScoreSubmission(
    request,
    gameConfig.maxScore,
  );

  if (!scoreSubmission) {
    return gameApiError("Invalid score.", 400);
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(GAME_PLAYER_COOKIE)?.value;

  if (!isValidPlayerToken(token)) {
    return gameApiError("Start a game run before submitting a score.", 401);
  }

  const playerTokenHash = hashPlayerToken(token);
  const runValidation = verifyGameScoreRun({
    gameKey,
    playerTokenHash,
    submission: scoreSubmission,
  });

  if (!runValidation.ok) return gameScoreRunError(runValidation.error);

  let supabase: ReturnType<typeof createAdminClient>;

  try {
    supabase = createAdminClient();
  } catch {
    return gameApiError("Score storage is not configured.", 500);
  }

  const country = getCountry(request.headers);

  const scoreResult = await submitGameScore({
    country,
    gameKey,
    playerTokenHash,
    run: runValidation.run,
    score: scoreSubmission.score,
    supabase,
  });

  if (!scoreResult.ok) {
    if (scoreResult.error === "run-reused") {
      return gameApiError(
        "This game run has already submitted a different score.",
        409,
      );
    }

    return gameApiError("Unable to save score.", 500);
  }

  const { entry } = scoreResult;
  const response = NextResponse.json({
    name: entry.name,
    highScore: entry.high_score,
    submittedScore: scoreSubmission.score,
    isNewHighScore: entry.is_new_high_score,
  });

  return response;
}

async function parseScoreSubmission(
  request: Request,
  maxScore: number,
): Promise<GameScoreSubmission | null> {
  const body = (await request.json().catch(() => null)) as {
    runToken?: unknown;
    score?: unknown;
  } | null;
  const score = Math.floor(Number(body?.score));

  if (!Number.isFinite(score) || score < 0 || score > maxScore) {
    return null;
  }

  if (typeof body?.runToken !== "string" || body.runToken.length > 4096) {
    return null;
  }

  return {
    runToken: body.runToken,
    score,
  };
}

function gameScoreRunError(
  error: "misconfigured" | "invalid-run" | "impossible-score",
) {
  if (error === "misconfigured") {
    return gameApiError("Game run verification is not configured.", 500);
  }

  if (error === "invalid-run") {
    return gameApiError("Invalid or expired game run.", 400);
  }

  return gameApiError("Score is too high for this game run.", 400);
}

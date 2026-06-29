import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { gameApiError } from "@/lib/games/api-response";
import { getGameKey } from "@/lib/games/config";
import { getPlayerHighScore } from "@/lib/games/leaderboard";
import {
  createPlayerToken,
  GAME_PLAYER_COOKIE,
  GAME_PLAYER_COOKIE_MAX_AGE,
  hashPlayerToken,
  isValidPlayerToken,
} from "@/lib/games/player-token";
import {
  createGameRunToken,
  getGameRunTokenSecret,
} from "@/lib/games/run-token";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    gameKey: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const gameKey = getGameKey((await params).gameKey);

  if (!gameKey) {
    return gameApiError("Unknown game.", 404);
  }

  let secret: string;

  try {
    secret = getGameRunTokenSecret();
  } catch {
    return gameApiError("Game run verification is not configured.", 500);
  }

  const cookieStore = await cookies();
  const existingToken = cookieStore.get(GAME_PLAYER_COOKIE)?.value;
  const token = isValidPlayerToken(existingToken)
    ? existingToken
    : createPlayerToken();
  const playerTokenHash = hashPlayerToken(token);
  const response = NextResponse.json({
    highScore: await getHighScore({
      gameKey,
      playerTokenHash,
    }),
    runToken: createGameRunToken({
      gameKey,
      playerTokenHash,
      secret,
    }),
  });

  response.headers.set("Cache-Control", "no-store");

  if (token !== existingToken) {
    response.cookies.set(GAME_PLAYER_COOKIE, token, {
      httpOnly: true,
      maxAge: GAME_PLAYER_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

async function getHighScore({
  gameKey,
  playerTokenHash,
}: {
  gameKey: NonNullable<ReturnType<typeof getGameKey>>;
  playerTokenHash: string;
}) {
  try {
    return await getPlayerHighScore({
      gameKey,
      playerTokenHash,
      supabase: createAdminClient(),
    });
  } catch {
    return 0;
  }
}

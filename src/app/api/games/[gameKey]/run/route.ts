import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getGameKey } from "@/lib/games/config";
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

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    gameKey: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteContext) {
  const gameKey = getGameKey((await params).gameKey);

  if (!gameKey) {
    return NextResponse.json({ error: "Unknown game." }, { status: 404 });
  }

  let secret: string;

  try {
    secret = getGameRunTokenSecret();
  } catch {
    return NextResponse.json(
      { error: "Game run verification is not configured." },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const existingToken = cookieStore.get(GAME_PLAYER_COOKIE)?.value;
  const token = isValidPlayerToken(existingToken)
    ? existingToken
    : createPlayerToken();
  const response = NextResponse.json({
    runToken: createGameRunToken({
      gameKey,
      playerTokenHash: hashPlayerToken(token),
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

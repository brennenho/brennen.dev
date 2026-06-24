import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getGameConfig, getGameKey, type GameKey } from "@/lib/games/config";
import {
  GAME_PLAYER_COOKIE,
  hashPlayerToken,
  isValidPlayerToken,
} from "@/lib/games/player-token";
import {
  getGameRunTokenSecret,
  verifyGameRunToken,
} from "@/lib/games/run-token";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-nf-country",
  "fastly-client-country-code",
  "x-country-code",
  "x-appengine-country",
  "x-geo-country",
] as const;
const UNKNOWN_COUNTRY_CODES = new Set(["", "XX", "ZZ", "UNKNOWN"]);
const REGION_DISPLAY_NAMES = new Intl.DisplayNames(["en"], {
  type: "region",
});

const ADJECTIVES = [
  "Brave",
  "Bright",
  "Calm",
  "Clever",
  "Cosmic",
  "Daring",
  "Electric",
  "Fuzzy",
  "Gentle",
  "Happy",
  "Lucky",
  "Mighty",
  "Nimble",
  "Pixel",
  "Quick",
  "Sunny",
  "Tiny",
  "Turbo",
  "Velvet",
  "Witty",
] as const;

const NOUNS = [
  "Comet",
  "Dino",
  "Echo",
  "Fern",
  "Glider",
  "Hero",
  "Jumper",
  "Lantern",
  "Meteor",
  "Noodle",
  "Orbit",
  "Pebble",
  "Quest",
  "Rocket",
  "Spark",
  "Sprout",
  "Trail",
  "Voyager",
  "Widget",
  "Zest",
] as const;

type GameLeaderboardEntry = {
  id: string;
  name: string;
  high_score: number;
  is_new_high_score: boolean;
};

type Country = {
  code: string;
  name: string;
};

type RouteContext = {
  params: Promise<{
    gameKey: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const gameKey = getGameKey((await params).gameKey);

  if (!gameKey) {
    return NextResponse.json({ error: "Unknown game." }, { status: 404 });
  }

  const gameConfig = getGameConfig(gameKey);
  const scoreSubmission = await parseScoreSubmission(
    request,
    gameConfig.maxScore,
  );

  if (!scoreSubmission) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(GAME_PLAYER_COOKIE)?.value;

  if (!isValidPlayerToken(token)) {
    return NextResponse.json(
      { error: "Start a game run before submitting a score." },
      { status: 401 },
    );
  }

  const playerTokenHash = hashPlayerToken(token);
  let runTokenSecret: string;

  try {
    runTokenSecret = getGameRunTokenSecret();
  } catch {
    return NextResponse.json(
      { error: "Game run verification is not configured." },
      { status: 500 },
    );
  }

  const run = verifyGameRunToken(scoreSubmission.runToken, {
    expectedGameKey: gameKey,
    expectedPlayerTokenHash: playerTokenHash,
    maxAgeMs: gameConfig.runTokenMaxAgeSeconds * 1000,
    secret: runTokenSecret,
  });

  if (!run) {
    return NextResponse.json(
      { error: "Invalid or expired game run." },
      { status: 400 },
    );
  }

  if (
    scoreSubmission.score >
    getMaxAllowedScore({
      elapsedMs: run.elapsedMs,
      scoreGraceSeconds: gameConfig.scoreGraceSeconds,
      scoreRatePerSecond: gameConfig.scoreRatePerSecond,
    })
  ) {
    return NextResponse.json(
      { error: "Score is too high for this game run." },
      { status: 400 },
    );
  }

  let supabase: ReturnType<typeof createAdminClient>;

  try {
    supabase = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "Score storage is not configured." },
      { status: 500 },
    );
  }

  const country = getCountry(request.headers);

  const entry = await submitScore({
    country,
    gameKey,
    playerTokenHash,
    score: scoreSubmission.score,
    supabase,
  });

  if (!entry) {
    return NextResponse.json(
      { error: "Unable to save score." },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    name: entry.name,
    highScore: entry.high_score,
    submittedScore: scoreSubmission.score,
    isNewHighScore: entry.is_new_high_score,
  });

  return response;
}

async function parseScoreSubmission(request: Request, maxScore: number) {
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

function getMaxAllowedScore({
  elapsedMs,
  scoreGraceSeconds,
  scoreRatePerSecond,
}: {
  elapsedMs: number;
  scoreGraceSeconds: number;
  scoreRatePerSecond: number;
}) {
  return Math.floor(
    (elapsedMs / 1000 + scoreGraceSeconds) * scoreRatePerSecond,
  );
}

async function submitScore({
  country,
  gameKey,
  playerTokenHash,
  score,
  supabase,
}: {
  country: Country | null;
  gameKey: GameKey;
  playerTokenHash: string;
  score: number;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const name = generateName(attempt);

    const { data, error } = await supabase
      .rpc("submit_game_score", {
        p_country_code: country?.code ?? null,
        p_country_name: country?.name ?? null,
        p_game_key: gameKey,
        p_name: name,
        p_player_token_hash: playerTokenHash,
        p_score: score,
      })
      .single<GameLeaderboardEntry>();

    if (!error) return data;

    if (error.code !== "23505") {
      if (process.env.NODE_ENV === "development") {
        console.warn("Unable to submit game score", {
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message,
        });
      }

      return null;
    }
  }

  return null;
}

function generateName(attempt: number) {
  const adjective = randomItem(ADJECTIVES);
  const noun = randomItem(NOUNS);
  const baseName = `${adjective} ${noun}`;

  return attempt === 0 ? baseName : `${baseName} ${randomNumber(1000, 9999)}`;
}

function getCountry(requestHeaders: Headers): Country | null {
  for (const header of COUNTRY_HEADERS) {
    const country = getCountryFromHeader(requestHeaders.get(header));

    if (country) return country;
  }

  return null;
}

function getCountryFromHeader(value: string | null): Country | null {
  const candidates = value
    ?.split(",")
    .map((candidate) => candidate.trim().toUpperCase())
    .filter(Boolean);

  for (const countryCode of candidates ?? []) {
    if (UNKNOWN_COUNTRY_CODES.has(countryCode)) continue;
    if (!/^[A-Z]{2}$/.test(countryCode)) continue;

    try {
      return {
        code: countryCode,
        name: REGION_DISPLAY_NAMES.of(countryCode) ?? countryCode,
      };
    } catch {
      return {
        code: countryCode,
        name: countryCode,
      };
    }
  }

  return null;
}

function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function randomNumber(minimum: number, maximum: number) {
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}

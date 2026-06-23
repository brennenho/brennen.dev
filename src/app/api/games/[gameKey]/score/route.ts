import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const GAMES = {
  dino: {
    maxScore: 1_000_000,
  },
} as const;

const LEADERBOARD_TABLE = "game_leaderboard_entries";
const PLAYER_COOKIE = "game_player_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;
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
};

type GameKey = keyof typeof GAMES;

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

  const score = await parseScore(request, GAMES[gameKey].maxScore);

  if (score == null) {
    return NextResponse.json({ error: "Invalid score." }, { status: 400 });
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

  const cookieStore = await cookies();
  const existingToken = cookieStore.get(PLAYER_COOKIE)?.value;
  const token = isValidToken(existingToken) ? existingToken : createToken();
  const shouldSetCookie = token !== existingToken;
  const playerTokenHash = hashToken(token);
  const country = getCountry(request.headers);
  const now = new Date().toISOString();

  const { data: existingEntry, error: existingError } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("id, name, high_score")
    .eq("game_key", gameKey)
    .eq("player_token_hash", playerTokenHash)
    .maybeSingle<GameLeaderboardEntry>();

  if (existingError) {
    return NextResponse.json(
      { error: "Unable to load player score." },
      { status: 500 },
    );
  }

  const isNewHighScore = existingEntry
    ? score > existingEntry.high_score
    : true;
  const entry = existingEntry
    ? await updateExistingEntry({
        country,
        existingEntry,
        gameKey,
        isNewHighScore,
        now,
        score,
        supabase,
      })
    : await createEntry({
        country,
        gameKey,
        now,
        playerTokenHash,
        score,
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
    submittedScore: score,
    isNewHighScore,
  });

  if (shouldSetCookie) {
    response.cookies.set(PLAYER_COOKIE, token, {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

async function parseScore(request: Request, maxScore: number) {
  const body = (await request.json().catch(() => null)) as {
    score?: unknown;
  } | null;
  const score = Math.floor(Number(body?.score));

  if (!Number.isFinite(score) || score < 0 || score > maxScore) {
    return null;
  }

  return score;
}

async function updateExistingEntry({
  country,
  existingEntry,
  gameKey,
  isNewHighScore,
  now,
  score,
  supabase,
}: {
  country: string | null;
  existingEntry: GameLeaderboardEntry;
  gameKey: GameKey;
  isNewHighScore: boolean;
  now: string;
  score: number;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const updatePayload: {
    country?: string;
    high_score: number;
    high_score_achieved_at?: string;
    last_played_at: string;
  } = {
    high_score: isNewHighScore ? score : existingEntry.high_score,
    last_played_at: now,
  };

  if (country) {
    updatePayload.country = country;
  }

  if (isNewHighScore) {
    updatePayload.high_score_achieved_at = now;
  }

  const { data, error } = await supabase
    .from(LEADERBOARD_TABLE)
    .update(updatePayload)
    .eq("id", existingEntry.id)
    .eq("game_key", gameKey)
    .select("id, name, high_score")
    .single<GameLeaderboardEntry>();

  if (error) return null;

  return data;
}

async function createEntry({
  country,
  gameKey,
  now,
  playerTokenHash,
  score,
  supabase,
}: {
  country: string | null;
  gameKey: GameKey;
  now: string;
  playerTokenHash: string;
  score: number;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const name = await generateUniqueName(supabase, gameKey, attempt);

    const { data, error } = await supabase
      .from(LEADERBOARD_TABLE)
      .insert({
        country: country ?? "Unknown",
        game_key: gameKey,
        high_score: score,
        high_score_achieved_at: now,
        last_played_at: now,
        name,
        player_token_hash: playerTokenHash,
      })
      .select("id, name, high_score")
      .single<GameLeaderboardEntry>();

    if (!error) return data;

    if (error.code !== "23505") return null;
  }

  return null;
}

async function generateUniqueName(
  supabase: ReturnType<typeof createAdminClient>,
  gameKey: GameKey,
  attempt: number,
) {
  const adjective = randomItem(ADJECTIVES);
  const noun = randomItem(NOUNS);
  const baseName = `${adjective} ${noun}`;
  const name =
    attempt === 0 ? baseName : `${baseName} ${randomNumber(100, 999)}`;

  const { data } = await supabase
    .from(LEADERBOARD_TABLE)
    .select("id")
    .eq("game_key", gameKey)
    .eq("name", name)
    .maybeSingle();

  if (!data) return name;

  return `${baseName} ${randomNumber(1000, 9999)}`;
}

function getCountry(requestHeaders: Headers) {
  for (const header of COUNTRY_HEADERS) {
    const country = getCountryFromHeader(requestHeaders.get(header));

    if (country) return country;
  }

  return null;
}

function getCountryFromHeader(value: string | null) {
  const candidates = value
    ?.split(",")
    .map((candidate) => candidate.trim().toUpperCase())
    .filter(Boolean);

  for (const countryCode of candidates ?? []) {
    if (UNKNOWN_COUNTRY_CODES.has(countryCode)) continue;
    if (!/^[A-Z]{2}$/.test(countryCode)) continue;

    try {
      return (
        new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ??
        countryCode
      );
    } catch {
      return countryCode;
    }
  }

  return null;
}

function getGameKey(value: string): GameKey | null {
  return value in GAMES ? (value as GameKey) : null;
}

function createToken() {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isValidToken(token: string | undefined): token is string {
  return !!token && token.length >= 32 && token.length <= 128;
}

function randomItem<T>(items: readonly T[]) {
  return items[Math.floor(Math.random() * items.length)] ?? items[0];
}

function randomNumber(minimum: number, maximum: number) {
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}

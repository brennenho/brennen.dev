import { createHmac, randomBytes, timingSafeEqual } from "crypto";

import type { GameKey } from "@/lib/games/config";

const RUN_TOKEN_VERSION = 1;
const CLOCK_SKEW_MS = 10_000;

type GameRunTokenPayload = {
  gameKey: GameKey;
  nonce: string;
  playerTokenHash: string;
  startedAt: number;
  version: typeof RUN_TOKEN_VERSION;
};

type CreateGameRunTokenOptions = {
  gameKey: GameKey;
  playerTokenHash: string;
  secret: string;
  startedAt?: number;
};

type VerifyGameRunTokenOptions = {
  expectedGameKey: GameKey;
  expectedPlayerTokenHash: string;
  maxAgeMs: number;
  now?: number;
  secret: string;
};

export function getGameRunTokenSecret() {
  const secret =
    process.env.GAME_RUN_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    throw new Error("Game run token secret is not configured.");
  }

  return secret;
}

export function createGameRunToken({
  gameKey,
  playerTokenHash,
  secret,
  startedAt = Date.now(),
}: CreateGameRunTokenOptions) {
  const payload: GameRunTokenPayload = {
    gameKey,
    nonce: randomBytes(16).toString("base64url"),
    playerTokenHash,
    startedAt,
    version: RUN_TOKEN_VERSION,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );

  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyGameRunToken(
  token: string,
  {
    expectedGameKey,
    expectedPlayerTokenHash,
    maxAgeMs,
    now = Date.now(),
    secret,
  }: VerifyGameRunTokenOptions,
) {
  const [encodedPayload, signature, ...extraParts] = token.split(".");

  if (!encodedPayload || !signature || extraParts.length > 0) return null;
  if (!safeEqual(signature, sign(encodedPayload, secret))) return null;

  const payload = parsePayload(encodedPayload);

  if (!payload) return null;
  if (payload.gameKey !== expectedGameKey) return null;
  if (payload.playerTokenHash !== expectedPlayerTokenHash) return null;
  if (payload.startedAt > now + CLOCK_SKEW_MS) return null;
  if (now - payload.startedAt > maxAgeMs) return null;

  return {
    elapsedMs: Math.max(0, now - payload.startedAt),
    payload,
  };
}

function parsePayload(encodedPayload: string): GameRunTokenPayload | null {
  try {
    const value = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as unknown;

    if (!isRecord(value)) return null;
    if (value.version !== RUN_TOKEN_VERSION) return null;
    if (typeof value.gameKey !== "string") return null;
    if (typeof value.nonce !== "string") return null;
    if (typeof value.playerTokenHash !== "string") return null;
    if (typeof value.startedAt !== "number") return null;
    if (!Number.isFinite(value.startedAt)) return null;

    return value as GameRunTokenPayload;
  } catch {
    return null;
  }
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

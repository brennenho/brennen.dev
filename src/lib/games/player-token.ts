import { createHash, randomBytes } from "crypto";

export const GAME_PLAYER_COOKIE = "game_player_token";
export const GAME_PLAYER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

export function createPlayerToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPlayerToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidPlayerToken(token: string | undefined): token is string {
  return !!token && token.length >= 32 && token.length <= 128;
}

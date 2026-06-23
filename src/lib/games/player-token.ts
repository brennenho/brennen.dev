import { createHash } from "crypto";

export const GAME_PLAYER_COOKIE = "game_player_token";

export function hashPlayerToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function isValidPlayerToken(token: string | undefined): token is string {
  return !!token && token.length >= 32 && token.length <= 128;
}

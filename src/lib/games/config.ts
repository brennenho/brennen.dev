const GAME_CONFIGS = {
  dino: {
    scoreEndpoint: "/api/games/dino/score",
    maxScore: 1_000_000,
  },
} as const;

type GameKey = keyof typeof GAME_CONFIGS;

export { GAME_CONFIGS };
export type { GameKey };

export function getGameConfig(gameKey: GameKey) {
  return GAME_CONFIGS[gameKey];
}

export function getGameKey(value: string): GameKey | null {
  return Object.prototype.hasOwnProperty.call(GAME_CONFIGS, value)
    ? (value as GameKey)
    : null;
}

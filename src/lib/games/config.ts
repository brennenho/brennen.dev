const GAME_CONFIGS = {
  dino: {
    maxScore: 20_000,
    runEndpoint: "/api/games/dino/run",
    runTokenMaxAgeSeconds: 60 * 30,
    scoreEndpoint: "/api/games/dino/score",
    scoreGraceSeconds: 4,
    scoreRatePerSecond: 12,
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

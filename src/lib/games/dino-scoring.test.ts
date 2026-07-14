import { describe, expect, it } from "vitest";

import { getMaxDinoScoreForElapsed } from "@/lib/games/dino-scoring";

import { simulateDinoScore } from "./dino-scoring.test-helper";

describe("Dino score envelope", () => {
  it.each([30, 60, 81, 120, 300, 1_058])(
    "contains a legitimate %d-second run",
    (elapsedSeconds) => {
      const score = simulateDinoScore(elapsedSeconds);

      expect(score).toBeLessThanOrEqual(
        getMaxDinoScoreForElapsed(elapsedSeconds * 1000),
      );
    },
  );

  it("still rejects a score above the reachable envelope", () => {
    expect(getMaxDinoScoreForElapsed(10_000)).toBeLessThan(200);
  });
});

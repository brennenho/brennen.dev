import { afterEach, describe, expect, it, vi } from "vitest";

const playerMocks = vi.hoisted(() => ({
  getSpotifyAccessToken: vi.fn(),
}));

vi.mock("@/app/api/spotify/player", () => {
  class SpotifyAuthError extends Error {
    constructor(readonly kind: string) {
      super(kind);
    }
  }

  return {
    getSpotifyAccessToken: playerMocks.getSpotifyAccessToken,
    SpotifyAuthError,
  };
});

import { SpotifyAuthError } from "@/app/api/spotify/player";
import { GET } from "@/app/api/spotify/health/route";

afterEach(() => {
  playerMocks.getSpotifyAccessToken.mockReset();
});

describe("GET /api/spotify/health", () => {
  it("returns a non-cacheable healthy response", async () => {
    playerMocks.getSpotifyAccessToken.mockResolvedValue("test-access-token");

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "healthy" });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("returns reauthorization_required only for invalid authorization", async () => {
    playerMocks.getSpotifyAccessToken.mockRejectedValue(
      new SpotifyAuthError("reauthorization_required"),
    );

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      status: "reauthorization_required",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it.each(["upstream_unavailable", "configuration_error"] as const)(
    "returns upstream_unavailable for %s",
    async (kind) => {
      playerMocks.getSpotifyAccessToken.mockRejectedValue(
        new SpotifyAuthError(kind),
      );

      const response = await GET();

      expect(response.status).toBe(502);
      await expect(response.json()).resolves.toEqual({
        status: "upstream_unavailable",
      });
      expect(response.headers.get("Cache-Control")).toBe("no-store");
    },
  );
});

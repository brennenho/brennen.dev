import { afterEach, describe, expect, it, vi } from "vitest";

const playerMocks = vi.hoisted(() => ({
  getCurrentlyPlaying: vi.fn(),
  getRecentlyPlayed: vi.fn(),
}));

vi.mock("@/app/api/spotify/player", () => {
  class SpotifyAuthError extends Error {
    constructor(readonly kind: string) {
      super(kind);
    }
  }

  return {
    getCurrentlyPlaying: playerMocks.getCurrentlyPlaying,
    getRecentlyPlayed: playerMocks.getRecentlyPlayed,
    SpotifyAuthError,
  };
});

import { SpotifyAuthError } from "@/app/api/spotify/player";
import { GET } from "@/app/api/spotify/route";

afterEach(() => {
  playerMocks.getCurrentlyPlaying.mockReset();
  playerMocks.getRecentlyPlayed.mockReset();
});

describe("GET /api/spotify", () => {
  it("preserves a successful currently-playing response", async () => {
    const current = {
      item: { name: "Test track" },
      is_playing: true,
    };
    playerMocks.getCurrentlyPlaying.mockResolvedValue(current);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(current);
  });

  it("returns a stable reauthorization response for invalid_grant", async () => {
    playerMocks.getCurrentlyPlaying.mockRejectedValue(
      new SpotifyAuthError("reauthorization_required"),
    );

    const response = await GET();

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      code: "SPOTIFY_REAUTHORIZATION_REQUIRED",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("normalizes transient Spotify failures to 502", async () => {
    playerMocks.getCurrentlyPlaying.mockResolvedValue(204);
    playerMocks.getRecentlyPlayed.mockResolvedValue(429);

    const response = await GET();

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      code: "SPOTIFY_UPSTREAM_UNAVAILABLE",
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
});

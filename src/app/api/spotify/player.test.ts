import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

import { getSpotifyAccessToken } from "@/app/api/spotify/player";

function configureSpotifyEnvironment() {
  vi.stubEnv("SPOTIFY_CLIENT_ID", "test-client-id");
  vi.stubEnv("SPOTIFY_CLIENT_SECRET", "test-client-secret");
  vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "test-refresh-token");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("getSpotifyAccessToken", () => {
  it("returns an access token after a successful refresh", async () => {
    configureSpotifyEnvironment();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        access_token: "test-access-token",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "user-read-recently-played",
      }),
    );

    await expect(getSpotifyAccessToken()).resolves.toBe("test-access-token");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("classifies invalid_grant without retrying", async () => {
    configureSpotifyEnvironment();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(jsonResponse({ error: "invalid_grant" }, 400));

    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      kind: "reauthorization_required",
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it.each([429, 500])(
    "classifies Spotify status %s as temporarily unavailable",
    async (status) => {
      configureSpotifyEnvironment();
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        jsonResponse({ error: "upstream_error" }, status),
      );

      await expect(getSpotifyAccessToken()).rejects.toMatchObject({
        kind: "upstream_unavailable",
      });
    },
  );

  it("classifies network failures as temporarily unavailable", async () => {
    configureSpotifyEnvironment();
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("network down"));

    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      kind: "upstream_unavailable",
    });
  });

  it("classifies malformed success responses as temporarily unavailable", async () => {
    configureSpotifyEnvironment();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({ access_token: "missing-required-fields" }),
    );

    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      kind: "upstream_unavailable",
    });
  });

  it("reports missing configuration without calling Spotify", async () => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", "");
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "");
    vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "");
    const fetchMock = vi.spyOn(globalThis, "fetch");

    await expect(getSpotifyAccessToken()).rejects.toMatchObject({
      kind: "configuration_error",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

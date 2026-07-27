"server-only";

import { revalidateTag } from "next/cache";
import { z } from "zod";

const TOKEN_CACHE_TAG = "spotify_access_token";

const token_schema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  scope: z.string(),
});

const token_error_schema = z.object({
  error: z.string(),
});

export type SpotifyAuthErrorKind =
  "reauthorization_required" | "upstream_unavailable" | "configuration_error";

export class SpotifyAuthError extends Error {
  constructor(readonly kind: SpotifyAuthErrorKind) {
    super(kind);
    this.name = "SpotifyAuthError";
  }
}

const track_schema = z.object({
  uri: z.string(),
  name: z.string(),
  album: z.object({
    name: z.string(),
    images: z.array(
      z.object({
        url: z.string(),
        height: z.number(),
        width: z.number(),
      }),
    ),
  }),
  artists: z.array(
    z.object({
      name: z.string(),
    }),
  ),
  duration_ms: z.number().optional(),
});

const recent_schema = z.object({
  items: z.array(z.object({ track: track_schema })),
});

const playing_schema = z.object({
  is_playing: z.boolean(),
  item: track_schema,
  progress_ms: z.number().optional(),
});

export async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!(refreshToken && clientSecret && clientId)) {
    throw new SpotifyAuthError("configuration_error");
  }

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
  };

  let response: Response;

  try {
    response = await fetch(authOptions.url, {
      method: "post",
      body: new URLSearchParams(authOptions.form),
      headers: authOptions.headers,
      next: { revalidate: 3600, tags: [TOKEN_CACHE_TAG] },
    });
  } catch {
    throw new SpotifyAuthError("upstream_unavailable");
  }

  let responseData: unknown;

  try {
    responseData = await response.json();
  } catch {
    throw new SpotifyAuthError("upstream_unavailable");
  }

  if (!response.ok) {
    const tokenError = token_error_schema.safeParse(responseData);

    if (
      response.status === 400 &&
      tokenError.success &&
      tokenError.data.error === "invalid_grant"
    ) {
      throw new SpotifyAuthError("reauthorization_required");
    }

    throw new SpotifyAuthError("upstream_unavailable");
  }

  const tokenData = token_schema.safeParse(responseData);

  if (!tokenData.success) {
    throw new SpotifyAuthError("upstream_unavailable");
  }

  return tokenData.data.access_token;
}

function callWithTokenRevalidation<T, P extends unknown[]>(
  f: (token: string, ...rest: P) => Promise<T | number>,
  revalidateCall = false,
) {
  return async (...params: P): Promise<T | number> => {
    const token = await getSpotifyAccessToken();

    const status = await f(token, ...params);

    if (typeof status === "number") {
      if (status === 401) {
        revalidateTag(TOKEN_CACHE_TAG, "max");
        if (!revalidateCall) {
          return callWithTokenRevalidation(f, true)(...params);
        }
      }
    }

    return status;
  };
}

async function getCurrentlyPlayingFetcher(token: string) {
  const playingOptions = {
    url: "https://api.spotify.com/v1/me/player/currently-playing",
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  const response = await fetch(playingOptions.url, {
    method: "get",
    headers: playingOptions.headers,
    next: { revalidate: 1 },
  });

  if (response.status !== 200) {
    return response.status;
  }

  const res_data = (await response.json()) as z.infer<typeof playing_schema>;
  const playing_data = playing_schema.parse(res_data);

  return playing_data;
}

const getRecentlyPlayedFetcher = async (token: string, limit = 1) => {
  const recentOptions = {
    url: "https://api.spotify.com/v1/me/player/recently-played",
    headers: {
      Authorization: "Bearer " + token,
    },
  };

  const url = new URL(recentOptions.url);
  url.searchParams.append("limit", String(limit));

  const response = await fetch(url, {
    method: "get",
    headers: recentOptions.headers,
    next: { revalidate: 60 },
  });

  if (response.status !== 200) {
    return response.status;
  }

  const res_data = (await response.json()) as z.infer<typeof recent_schema>;
  const recent_data = recent_schema.parse(res_data);

  return recent_data;
};

export const getCurrentlyPlaying = callWithTokenRevalidation(
  getCurrentlyPlayingFetcher,
);

export const getRecentlyPlayed = callWithTokenRevalidation(
  getRecentlyPlayedFetcher,
);

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

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  if (!(REFRESH_TOKEN && CLIENT_SECRET && CLIENT_ID)) {
    return null;
  }

  const authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    },
    json: true,
  };

  const response = await fetch(authOptions.url, {
    method: "post",
    body: new URLSearchParams(authOptions.form),
    headers: authOptions.headers,
    next: { revalidate: 3600, tags: [TOKEN_CACHE_TAG] },
  });
  const res_data = (await response.json()) as z.infer<typeof token_schema>;
  const token_data = token_schema.parse(res_data);

  return token_data.access_token;
}

function callWithTokenRevalidation<T, P extends unknown[]>(
  f: (token: string, ...rest: P) => Promise<T | number>,
  revalidateCall = false,
) {
  return async (...params: P): Promise<T | number> => {
    const token = await getAccessToken();
    if (!token) {
      return 404;
    }

    const status = await f(token, ...params);

    if (typeof status === "number") {
      if (status === 401) {
        revalidateTag(TOKEN_CACHE_TAG);
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

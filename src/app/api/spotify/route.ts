import {
  getCurrentlyPlaying,
  getRecentlyPlayed,
  SpotifyAuthError,
} from "@/app/api/spotify/player";
import { NextResponse } from "next/server";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

function spotifyUnavailableResponse() {
  return NextResponse.json(
    {
      error: "Spotify is temporarily unavailable",
      code: "SPOTIFY_UPSTREAM_UNAVAILABLE",
    },
    { status: 502, headers: NO_STORE_HEADERS },
  );
}

export async function GET() {
  try {
    const current = await getCurrentlyPlaying();
    if (typeof current !== "number" && current.is_playing) {
      return NextResponse.json(current);
    }

    const recent = await getRecentlyPlayed(1);
    if (typeof recent === "number") {
      return spotifyUnavailableResponse();
    }

    if (recent.items.length > 0 && recent.items[0]?.track) {
      return NextResponse.json({
        item: recent.items[0].track,
        is_playing: false,
        progress_ms: 0,
      });
    }

    return NextResponse.json(
      { error: "No tracks found" },
      { status: 404, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    if (error instanceof SpotifyAuthError) {
      if (error.kind === "reauthorization_required") {
        return NextResponse.json(
          {
            error: "Spotify authorization needs renewal",
            code: "SPOTIFY_REAUTHORIZATION_REQUIRED",
          },
          { status: 503, headers: NO_STORE_HEADERS },
        );
      }

      return spotifyUnavailableResponse();
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

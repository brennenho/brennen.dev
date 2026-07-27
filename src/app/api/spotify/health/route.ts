import {
  getSpotifyAccessToken,
  SpotifyAuthError,
} from "@/app/api/spotify/player";
import { NextResponse } from "next/server";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    await getSpotifyAccessToken();

    return NextResponse.json(
      { status: "healthy" },
      { headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    if (
      error instanceof SpotifyAuthError &&
      error.kind === "reauthorization_required"
    ) {
      return NextResponse.json(
        { status: "reauthorization_required" },
        { status: 503, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json(
      { status: "upstream_unavailable" },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}

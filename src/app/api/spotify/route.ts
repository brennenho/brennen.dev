import { getCurrentlyPlaying, getRecentlyPlayed } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const current = await getCurrentlyPlaying();
    if (typeof current !== "number" && current.is_playing) {
      return NextResponse.json(current);
    }

    const recent = await getRecentlyPlayed(1);
    if (typeof recent === "number") {
      return NextResponse.json(
        { error: "Failed to fetch recent tracks" },
        { status: recent },
      );
    }

    if (recent.items.length > 0 && recent.items[0]?.track) {
      return NextResponse.json({
        item: recent.items[0].track,
        is_playing: false,
        progress_ms: 0,
      });
    }

    return NextResponse.json({ error: "No tracks found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

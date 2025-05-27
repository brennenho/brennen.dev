"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentlyPlaying } from "@/lib/spotify";
import Image from "next/image";
import { useEffect, useState } from "react";

type SpotifyTrack = {
  item: {
    uri: string;
    name: string;
    album: {
      name: string;
      images: Array<{ url: string; width: number; height: number }>;
    };
    artists: Array<{ name: string }>;
    duration_ms?: number;
  };
  progress_ms?: number;
  is_playing: boolean;
};

export function CurrentlyPlaying() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    const fetchCurrentlyPlaying = async () => {
      const result = await getCurrentlyPlaying();
      if (typeof result !== "number") {
        setTrack(result);
      } else {
        setTrack(null);
      }
    };

    setInterval(() => {
      fetchCurrentlyPlaying();
    }, 1000);
  }, []);

  const formatTime = (ms: number | undefined) => {
    if (!ms) return "0:00";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!track) {
    return null;
  }

  if (typeof track === "number") {
    return null;
  }

  return (
    <Card className="w-80 p-4">
      <CardContent className="flex flex-row items-center gap-4 p-0">
        <Image
          src={
            track.item.album.images?.sort(
              (album1, album2) => album2.width - album1.width,
            )[0]?.url ?? ""
          }
          alt="Cover"
          width={50}
          height={50}
          className="shadow-album aspect-square rounded-lg border object-cover"
        />
        <div className="flex w-full flex-col gap-1">
          <div className="flex flex-col gap-0.5 leading-none">
            <div className="text-sm font-semibold">{track.item.name}</div>
            <div className="text-xs italic">
              {track.item.artists.map((a) => a.name).join(", ")}
            </div>
          </div>

          <div className="flex flex-row items-center gap-1 text-xs font-medium">
            {formatTime(track.progress_ms)}

            <Progress
              value={
                ((track.progress_ms ?? 0) / (track.item.duration_ms ?? 0)) * 100
              }
              className="h-1.5"
            />
            {formatTime(track.item.duration_ms)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

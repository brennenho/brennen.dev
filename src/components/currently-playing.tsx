"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentlyPlaying } from "@/lib/spotify";
import { HeadphoneOff } from "lucide-react";
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

  if (typeof track === "number") {
    return null;
  }

  return (
    <Card className="w-72 p-4">
      <CardContent className="flex flex-row items-center gap-4 p-0">
        <div className="shadow-album flex aspect-square h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-lg border">
          {track ? (
            track.is_playing ? (
              <Image
                src={
                  track.item.album.images?.sort(
                    (album1, album2) => album2.width - album1.width,
                  )[0]?.url ?? ""
                }
                alt="Cover"
                width={50}
                height={50}
                className="object-cover"
              />
            ) : (
              <HeadphoneOff className="h-6 w-6" />
            )
          ) : (
            <Skeleton className="h-[50px] w-[50px]" />
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex flex-col gap-0.5 leading-none">
            {track ? (
              <>
                <div className="text-sm font-semibold">
                  {track.is_playing ? track.item.name : "Offline"}
                </div>
                <div className="text-xs italic">
                  {track.is_playing
                    ? track.item.artists.map((a) => a.name).join(", ")
                    : "Not currently playing anything"}
                </div>
              </>
            ) : (
              <>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </>
            )}
          </div>

          {track ? (
            <div className="flex flex-row items-center gap-1 text-xs font-medium">
              {track.is_playing ? formatTime(track?.progress_ms) : "0:00"}

              <Progress
                value={
                  track.is_playing
                    ? ((track?.progress_ms ?? 0) /
                        (track?.item.duration_ms ?? 0)) *
                      100
                    : 0
                }
                className="h-1.5"
              />
              {track.is_playing ? formatTime(track?.item.duration_ms) : "0:00"}
            </div>
          ) : (
            <Skeleton className="h-4" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

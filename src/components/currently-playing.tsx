"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentlyPlaying, getRecentlyPlayed } from "@/lib/spotify";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";

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
      let next: SpotifyTrack | null = null;

      const current = await getCurrentlyPlaying();
      if (typeof current !== "number" && current.is_playing) {
        next = current;
      } else {
        const recent = await getRecentlyPlayed(1);
        if (
          recent &&
          typeof recent !== "number" &&
          recent.items.length > 0 &&
          recent.items[0]?.track
        ) {
          next = {
            item: recent.items[0].track,
            is_playing: false,
            progress_ms: 0,
          };
        }
      }

      setTrack(next);
    };

    fetchCurrentlyPlaying();

    const id = setInterval(fetchCurrentlyPlaying, 1000);
    return () => clearInterval(id);
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
    <div className="flex w-full flex-col gap-1 sm:w-72">
      {track?.is_playing ? (
        <div className="font-semibold">I&apos;m currently playing:</div>
      ) : (
        <div className="font-semibold">I most recently played:</div>
      )}

      <Card className="w-full p-4 sm:w-72">
        <CardContent className="flex flex-row items-center gap-4 p-0">
          <div className="shadow-album flex aspect-square h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-lg border">
            {track ? (
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
              <Skeleton className="h-[50px] w-[50px]" />
            )}
          </div>

          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-row justify-between">
              <div className="flex w-full flex-col gap-0.5 leading-none">
                {track ? (
                  <>
                    <div className="line-clamp-2 text-sm font-semibold">
                      {track?.item.name}
                    </div>
                    <div className="line-clamp-1 text-xs italic">
                      {track?.item.artists.map((a) => a.name).join(", ")}
                    </div>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </>
                )}
              </div>
              {track &&
                (track.is_playing ? (
                  <Badge className="bg-primary/20 text-primary flex items-center gap-1.5 self-start">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="bg-primary absolute inline-flex h-full w-full animate-[ping_1.5s_ease-in-out_infinite] rounded-full opacity-75"></span>
                      <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full"></span>
                    </span>
                    live
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1.5 self-start"
                  >
                    offline
                  </Badge>
                ))}
            </div>

            {track && track.is_playing && (
              <div className="flex flex-row items-center gap-1 text-xs font-medium">
                {formatTime(track.progress_ms)}

                <Progress
                  value={
                    ((track.progress_ms ?? 0) / (track.item.duration_ms ?? 0)) *
                    100
                  }
                  className="h-1.5"
                />
                {formatTime(track.item.duration_ms)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

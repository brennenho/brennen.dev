"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting && !document.hidden);
        }
      },
      {
        threshold: 0.1,
      },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchCurrentlyPlaying = async () => {
      try {
        const response = await fetch("/api/spotify");
        if (!response.ok) {
          setTrack(null);
          return;
        }
        const data = await response.json();
        setTrack(data);
      } catch (error) {
        console.error("Failed to fetch Spotify data:", error);
        setTrack(null);
      }
    };

    void fetchCurrentlyPlaying();

    const id = setInterval(() => {
      if (isVisible) {
        void fetchCurrentlyPlaying();
      }
    }, 2000);
    return () => clearInterval(id);
  }, [isVisible]);

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
    <div ref={containerRef} className="flex w-full flex-col gap-1 sm:w-72">
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
                    <div className="flex flex-row items-center justify-between">
                      <div className="line-clamp-2 text-sm font-semibold">
                        {track.item.name}
                      </div>
                      {track.is_playing ? (
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
                      )}
                    </div>
                    <div className="line-clamp-1 text-xs italic">
                      {track.item.artists.map((a) => a.name).join(", ")}
                    </div>
                  </>
                ) : (
                  <>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </>
                )}
              </div>
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

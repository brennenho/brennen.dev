"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type SpotifyTrack = {
  item: {
    uri: string;
    name: string;
    external_urls?: {
      spotify?: string;
    };
    album: {
      name: string;
      images: Array<{ url: string; width: number; height: number }>;
    };
    artists: Array<{ name: string }>;
    duration_ms?: number;
  };
  is_playing: boolean;
  progress_ms?: number;
};

export function SpotifyMention() {
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [popoverFrame, setPopoverFrame] = useState({
    left: 0,
    top: 0,
    width: 288,
  });
  const closeTimerRef = useRef<number | null>(null);
  const mentionRef = useRef<HTMLSpanElement>(null);
  const fetchedAtRef = useRef(Date.now());

  useEffect(() => {
    let mounted = true;

    async function fetchTrack() {
      try {
        const response = await fetch("/api/spotify");
        if (!response.ok) return;
        const data = (await response.json()) as SpotifyTrack;
        if (mounted) {
          fetchedAtRef.current = Date.now();
          setTrack(data);
          setNow(Date.now());
        }
      } finally {
        if (mounted) setLoaded(true);
      }
    }

    void fetchTrack();
    const id = window.setInterval(fetchTrack, 2000);

    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    function closeImmediately() {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      setOpen(false);
    }

    window.addEventListener("scroll", closeImmediately, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", closeImmediately);
    window.addEventListener("touchmove", closeImmediately, { passive: true });

    return () => {
      window.removeEventListener("scroll", closeImmediately, { capture: true });
      window.removeEventListener("resize", closeImmediately);
      window.removeEventListener("touchmove", closeImmediately);
    };
  }, [open]);

  const image = track?.item.album.images
    ?.slice()
    .sort((a, b) => b.width - a.width)[0];
  const song = track?.item.name ?? "Landslide";
  const artist =
    track?.item.artists.map((entry) => entry.name).join(", ") ??
    "Fleetwood Mac";
  const href =
    track?.item.external_urls?.spotify ??
    track?.item.uri?.replace(
      "spotify:track:",
      "https://open.spotify.com/track/",
    );
  const duration = track?.item.duration_ms ?? 0;
  const progress = useMemo(() => {
    if (!track) return 0;

    const base = track.progress_ms ?? 0;
    const elapsed = track.is_playing ? now - fetchedAtRef.current : 0;

    return Math.min(duration, base + elapsed);
  }, [duration, now, track]);
  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const isLive = track?.is_playing ?? false;

  function updatePlacement() {
    const rect = mentionRef.current?.getBoundingClientRect();
    if (!rect) return;

    const viewportGap = 16;
    const popoverWidth = Math.min(288, window.innerWidth - viewportGap * 2);
    const popoverHeight = 88;
    const gap = 8;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const nextPlacement = spaceBelow >= popoverHeight + gap ? "bottom" : "top";
    const left = Math.min(
      Math.max(rect.left, viewportGap),
      window.innerWidth - popoverWidth - viewportGap,
    );
    const top =
      nextPlacement === "bottom"
        ? rect.bottom + gap
        : spaceAbove >= popoverHeight + gap
          ? rect.top - gap
          : viewportGap;

    setPlacement(nextPlacement);
    setPopoverFrame({ left, top, width: popoverWidth });
  }

  function openPopover() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    updatePlacement();
    setOpen(true);
  }

  function closePopover() {
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, 100);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2 align-middle">
      <span>
        {isLive ? "I’m currently listening to:" : "The last song I played was"}
      </span>
      <span
        ref={mentionRef}
        onBlurCapture={closePopover}
        onFocusCapture={openPopover}
        onPointerEnter={openPopover}
        onPointerLeave={closePopover}
        className="group relative inline-flex align-middle"
      >
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-[#333332] px-2 py-1 text-[15px] leading-none font-bold text-[#f1f1ef] transition-colors hover:bg-[#3d3d3c]"
        >
          <SpotifyLogo className="h-5 w-5 text-[#1ed760]" />
          <span className="text-[#a9a9a7]">Spotify</span>
          {loaded ? <span>{song}</span> : <Skeleton className="h-4 w-20" />}
        </a>

        <span
          data-placement={placement}
          onPointerEnter={openPopover}
          onPointerLeave={closePopover}
          style={{
            ...popoverFrame,
            transform: placement === "top" ? "translateY(-100%)" : undefined,
          }}
          className={cn("fixed z-50", open ? "block" : "hidden")}
        >
          <Card className="w-full rounded-md border-[#3a3a39] bg-[#2f2f2e] p-4 text-[#f1f1ef] shadow-none">
            <CardContent className="flex flex-row items-center gap-4 p-0">
              <div className="flex aspect-square h-[50px] w-[50px] items-center justify-center overflow-hidden rounded-lg border border-[#3a3a39] bg-[#202020] shadow-none">
                {track && image ? (
                  <Image
                    src={image.url}
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
                          <div className="line-clamp-2 text-sm font-semibold text-[#f1f1ef]">
                            {song}
                          </div>
                          {isLive ? (
                            <Badge className="flex items-center gap-1.5 self-start bg-[#1ed760]/20 text-[#1ed760]">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-[ping_1.5s_ease-in-out_infinite] rounded-full bg-[#1ed760] opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1ed760]" />
                              </span>
                              live
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1.5 self-start bg-[#3d3d3c] text-[#d4d4d1]"
                            >
                              offline
                            </Badge>
                          )}
                        </div>
                        <div className="line-clamp-1 text-xs text-[#d4d4d1] italic">
                          {artist}
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

                {track && isLive && duration > 0 ? (
                  <div className="flex flex-row items-center gap-1 text-xs font-medium text-[#f1f1ef] tabular-nums">
                    {formatTime(progress)}
                    <Progress
                      value={progressPercent}
                      className="h-1.5 bg-[#1ed760]/20 [&>div]:bg-[#1ed760]"
                    />
                    {formatTime(duration)}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </span>
      </span>
    </span>
  );
}

function formatTime(ms: number | undefined) {
  if (!ms) return "0:00";
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function SpotifyLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.508 17.308a.747.747 0 0 1-1.028.247c-2.817-1.722-6.363-2.111-10.536-1.156a.748.748 0 1 1-.333-1.458c4.568-1.045 8.488-.596 11.65 1.336.352.215.463.677.247 1.031Zm1.47-3.273a.936.936 0 0 1-1.287.308c-3.224-1.982-8.139-2.557-11.95-1.399a.937.937 0 1 1-.545-1.794c4.355-1.322 9.771-.681 13.474 1.596.44.271.578.848.308 1.289Zm.126-3.409C15.237 8.33 8.862 8.118 5.175 9.238a1.125 1.125 0 1 1-.654-2.153c4.233-1.286 11.276-1.037 15.731 1.608a1.125 1.125 0 0 1-1.148 1.933Z" />
    </svg>
  );
}
